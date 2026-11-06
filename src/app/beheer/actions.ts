"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { SERVICE_SLUGS } from "@/config/services";
import { authConfigError, checkPassword, createSession, destroySession, requireAdmin } from "@/lib/auth";
import {
  APPOINTMENT_KINDS,
  ASPECTS,
  getStorage,
  PROJECT_TYPES,
  REQUEST_STATUSES,
  type AppointmentInput,
  type ProjectInput,
} from "@/lib/storage";

/* ---------- Inloggen ---------- */

export type LoginState = { error?: string };

const failures = new Map<string, { count: number; until: number }>();

export async function login(_prev: LoginState, fd: FormData): Promise<LoginState> {
  const configError = authConfigError();
  if (configError) return { error: `Beheer is nog niet ingesteld: ${configError}` };

  const key = "global";
  const f = failures.get(key);
  if (f && f.until > Date.now()) {
    return { error: "Te veel pogingen. Wacht een minuut en probeer het opnieuw." };
  }

  const password = String(fd.get("password") ?? "");
  if (!checkPassword(password)) {
    const count = (f?.count ?? 0) + 1;
    failures.set(key, { count, until: count >= 5 ? Date.now() + 60_000 : 0 });
    await new Promise((r) => setTimeout(r, 500));
    return { error: "Onjuist wachtwoord." };
  }
  failures.delete(key);
  await createSession();
  redirect("/beheer");
}

export async function logout() {
  await destroySession();
  redirect("/beheer/login");
}

/* ---------- Aanvragen ---------- */

export async function updateRequestStatus(fd: FormData) {
  await requireAdmin();
  const id = z.string().uuid().safeParse(fd.get("id"));
  const status = z.enum(REQUEST_STATUSES).safeParse(fd.get("status"));
  if (!id.success || !status.success) return;
  const storage = await getStorage();
  await storage.updateRequestStatus(id.data, status.data);
  revalidatePath("/beheer", "layout");
}

export type RequestFormState = { ok?: boolean; error?: string };

export async function addRequestNote(_prev: RequestFormState, fd: FormData): Promise<RequestFormState> {
  await requireAdmin();
  const id = z.string().uuid().safeParse(fd.get("id"));
  const text = z.string().trim().min(1, "Schrijf eerst een notitie.").max(4000, "Houd de notitie korter dan 4000 tekens.").safeParse(fd.get("text"));
  if (!id.success) return { error: "Onbekende aanvraag." };
  if (!text.success) return { error: text.error.issues[0]?.message };
  const ok = await (await getStorage()).addRequestEvent(id.data, "note", text.data);
  if (!ok) return { error: "Deze aanvraag bestaat niet meer." };
  revalidatePath(`/beheer/aanvragen/${id.data}`);
  return { ok: true };
}

/** "1.250", "1250,50", "€ 1.250,-" → centen. Leeg = prijs wissen. */
function parseEuro(raw: string): number | null | "invalid" {
  const s = raw.replace(/[€\s]/g, "").replace(/,-$/, "");
  if (s === "") return null;
  const normalized = s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : /^\d{1,3}(\.\d{3})+$/.test(s) ? s.replace(/\./g, "") : s;
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0 || n > 1_000_000) return "invalid";
  return Math.round(n * 100);
}

export async function setRequestPrice(_prev: RequestFormState, fd: FormData): Promise<RequestFormState> {
  await requireAdmin();
  const id = z.string().uuid().safeParse(fd.get("id"));
  if (!id.success) return { error: "Onbekende aanvraag." };
  const cents = parseEuro(String(fd.get("price") ?? ""));
  if (cents === "invalid") return { error: "Vul een bedrag in, bijvoorbeeld 1250 of 1.250,00." };
  const ok = await (await getStorage()).setRequestPrice(id.data, cents);
  if (!ok) return { error: "Deze aanvraag bestaat niet meer." };
  revalidatePath("/beheer", "layout");
  return { ok: true };
}

export async function deleteRequest(fd: FormData) {
  await requireAdmin();
  const id = z.string().uuid().safeParse(fd.get("id"));
  if (!id.success || fd.get("confirm") !== "on") return;
  await (await getStorage()).deleteRequest(id.data);
  revalidatePath("/beheer", "layout");
  redirect("/beheer/aanvragen?verwijderd=1");
}

/* ---------- Agenda ---------- */

const ymdRe = /^\d{4}-\d{2}-\d{2}$/;
const hmRe = /^([01]\d|2[0-3]):[0-5]\d$/;

const appointmentSchema = z
  .object({
    kind: z.enum(APPOINTMENT_KINDS),
    title: z.string().trim().min(2, "Geef de afspraak een titel.").max(120),
    requestId: z.union([z.string().uuid(), z.literal("")]).transform((v) => v || null),
    startDate: z.string().regex(ymdRe, "Kies een startdatum."),
    endDate: z.string().regex(ymdRe, "Kies een einddatum."),
    allDay: z.boolean(),
    startTime: z.string(),
    endTime: z.string(),
    notes: z.string().trim().max(2000).transform((v) => v || null),
  })
  .superRefine((a, ctx) => {
    if (a.endDate < a.startDate) ctx.addIssue({ code: "custom", path: ["endDate"], message: "De einddatum ligt vóór de startdatum." });
    if (!a.allDay) {
      if (!hmRe.test(a.startTime)) ctx.addIssue({ code: "custom", path: ["startTime"], message: "Kies een starttijd." });
      if (!hmRe.test(a.endTime)) ctx.addIssue({ code: "custom", path: ["endTime"], message: "Kies een eindtijd." });
      if (a.startDate === a.endDate && hmRe.test(a.startTime) && hmRe.test(a.endTime) && a.endTime <= a.startTime)
        ctx.addIssue({ code: "custom", path: ["endTime"], message: "De eindtijd ligt vóór de starttijd." });
    }
  });

export type AppointmentFormState = { errors?: Record<string, string>; formError?: string; values?: Record<string, string> };

export async function saveAppointment(id: string | null, _prev: AppointmentFormState, fd: FormData): Promise<AppointmentFormState> {
  await requireAdmin();
  const raw = {
    kind: String(fd.get("kind") ?? "werk"),
    title: String(fd.get("title") ?? ""),
    requestId: String(fd.get("requestId") ?? ""),
    startDate: String(fd.get("startDate") ?? ""),
    endDate: String(fd.get("endDate") ?? "") || String(fd.get("startDate") ?? ""),
    startTime: String(fd.get("startTime") ?? ""),
    endTime: String(fd.get("endTime") ?? ""),
    notes: String(fd.get("notes") ?? ""),
  };
  const allDay = fd.get("allDay") === "on";
  const values = { ...raw, allDay: allDay ? "on" : "" };
  const parsed = appointmentSchema.safeParse({ ...raw, allDay });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0] ?? "form")] ??= issue.message;
    return { errors, values };
  }
  const a = parsed.data;
  const input: AppointmentInput = {
    kind: a.kind,
    title: a.title,
    requestId: a.kind === "blokkade" ? null : a.requestId,
    startDate: a.startDate,
    endDate: a.endDate,
    startTime: a.allDay ? null : a.startTime,
    endTime: a.allDay ? null : a.endTime,
    notes: a.notes,
  };

  try {
    const storage = await getStorage();
    if (id) {
      const updated = await storage.updateAppointment(id, input);
      if (!updated) return { formError: "Deze afspraak bestaat niet meer.", values };
    } else {
      await storage.createAppointment(input);
      // Nieuw ingepland werk aan een aanvraag: tijdlijn bijwerken en status doorzetten.
      if (input.requestId) {
        const req = await storage.getRequest(input.requestId);
        if (req) {
          await storage.addRequestEvent(req.id, "planned", input.startDate);
          if ((req.status === "nieuw" || req.status === "in-behandeling") && input.kind === "werk") {
            await storage.updateRequestStatus(req.id, "ingepland");
          }
        }
      }
    }
  } catch (err) {
    console.error("[beheer] Afspraak opslaan mislukt:", err);
    return { formError: "Opslaan mislukt. Probeer het opnieuw.", values };
  }
  revalidatePath("/beheer", "layout");
  redirect(`/beheer/agenda?maand=${input.startDate.slice(0, 7)}&opgeslagen=1`);
}

export async function deleteAppointment(fd: FormData) {
  await requireAdmin();
  const id = z.string().uuid().safeParse(fd.get("id"));
  if (!id.success) return;
  const storage = await getStorage();
  const a = await storage.getAppointment(id.data);
  await storage.deleteAppointment(id.data);
  revalidatePath("/beheer", "layout");
  redirect(`/beheer/agenda${a ? `?maand=${a.startDate.slice(0, 7)}` : ""}`);
}

/* ---------- Projecten ---------- */

const mediaPath = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || v.startsWith("/") || /^https:\/\//.test(v), "Gebruik een pad dat met / begint of een https-adres.")
  .transform((v) => (v === "" ? null : v));

const projectSchema = z
  .object({
    title: z.string().trim().min(2, "Vul een titel in.").max(120),
    service: z.union([z.enum(SERVICE_SLUGS), z.literal("")]).transform((v) => (v === "" ? null : v)),
    vehicle: z.string().trim().max(120).transform((v) => v || null),
    description: z.string().trim().max(800).transform((v) => v || null),
    type: z.enum(PROJECT_TYPES),
    aspect: z.enum(ASPECTS),
    imageSrc: mediaPath,
    imageAlt: z.string().trim().max(200),
    videoSrc: mediaPath,
    beforeSrc: mediaPath,
    afterSrc: mediaPath,
    published: z.boolean(),
    sortOrder: z.coerce.number().int().min(-9999).max(9999),
  })
  .superRefine((p, ctx) => {
    if (p.type === "foto" && !p.imageSrc) ctx.addIssue({ code: "custom", path: ["imageSrc"], message: "Een foto heeft een beeld nodig." });
    if (p.type === "video" && !p.videoSrc) ctx.addIssue({ code: "custom", path: ["videoSrc"], message: "Vul het pad naar de video in." });
    if (p.type === "voor-na") {
      if (!p.beforeSrc) ctx.addIssue({ code: "custom", path: ["beforeSrc"], message: "Vul het voor-beeld in." });
      if (!p.afterSrc) ctx.addIssue({ code: "custom", path: ["afterSrc"], message: "Vul het na-beeld in." });
    }
    if (p.type === "foto" && p.imageAlt.length < 3)
      ctx.addIssue({ code: "custom", path: ["imageAlt"], message: "Beschrijf kort wat er op de foto staat." });
  });

export type ProjectFormState = { errors?: Record<string, string>; formError?: string; values?: Record<string, string> };

export async function saveProject(id: string | null, _prev: ProjectFormState, fd: FormData): Promise<ProjectFormState> {
  await requireAdmin();
  const raw = {
    title: String(fd.get("title") ?? ""),
    service: String(fd.get("service") ?? ""),
    vehicle: String(fd.get("vehicle") ?? ""),
    description: String(fd.get("description") ?? ""),
    type: String(fd.get("type") ?? "foto"),
    aspect: String(fd.get("aspect") ?? "3/2"),
    imageSrc: String(fd.get("imageSrc") ?? ""),
    imageAlt: String(fd.get("imageAlt") ?? ""),
    videoSrc: String(fd.get("videoSrc") ?? ""),
    beforeSrc: String(fd.get("beforeSrc") ?? ""),
    afterSrc: String(fd.get("afterSrc") ?? ""),
    sortOrder: String(fd.get("sortOrder") ?? "0"),
  };
  const parsed = projectSchema.safeParse({ ...raw, published: fd.get("published") === "on" });
  const values = { ...raw, published: fd.get("published") === "on" ? "on" : "" };
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = String(issue.path[0] ?? "form");
      errors[k] ??= issue.message;
    }
    return { errors, values };
  }
  const input: ProjectInput = parsed.data;
  try {
    const storage = await getStorage();
    if (id) {
      const updated = await storage.updateProject(id, input);
      if (!updated) return { formError: "Dit project bestaat niet meer.", values };
    } else {
      await storage.createProject(input);
    }
  } catch (err) {
    console.error("[beheer] Project opslaan mislukt:", err);
    return { formError: "Opslaan mislukt. Controleer de opslagconfiguratie (zie README).", values };
  }
  revalidatePath("/", "layout");
  redirect("/beheer/projecten?opgeslagen=1");
}

export async function setPublished(fd: FormData) {
  await requireAdmin();
  const id = z.string().uuid().safeParse(fd.get("id"));
  if (!id.success) return;
  const storage = await getStorage();
  await storage.setProjectPublished(id.data, fd.get("published") === "true");
  revalidatePath("/", "layout");
}

export async function deleteProject(fd: FormData) {
  await requireAdmin();
  const id = z.string().uuid().safeParse(fd.get("id"));
  if (!id.success || fd.get("confirm") !== "on") return;
  const storage = await getStorage();
  await storage.deleteProject(id.data);
  revalidatePath("/", "layout");
  redirect("/beheer/projecten");
}
