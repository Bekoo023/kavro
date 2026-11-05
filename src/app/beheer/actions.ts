"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { SERVICE_SLUGS } from "@/config/services";
import { authConfigError, checkPassword, createSession, destroySession, requireAdmin } from "@/lib/auth";
import { ASPECTS, getStorage, PROJECT_TYPES, REQUEST_STATUSES, type ProjectInput } from "@/lib/storage";

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
  revalidatePath("/beheer");
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
