import { z } from "zod";
import { FINISH_SLUGS, SERVICE_SLUGS } from "@/config/services";

/** Gedeeld door formulier (client) en server action. */

export type QuoteFields = {
  services: string[];
  finish: string;
  vehicle: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  preferredDate: string;
};

export type QuoteFieldName = keyof QuoteFields | "contact";
export type QuoteErrors = Partial<Record<QuoteFieldName, string>>;

export const emptyQuoteFields: QuoteFields = {
  services: [],
  finish: "",
  vehicle: "",
  name: "",
  email: "",
  phone: "",
  message: "",
  preferredDate: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function todayIso() {
  // Datum in Nederlandse tijd, zodat 'vandaag' ook om 00:30 klopt.
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Amsterdam" }).format(new Date());
}

const schema = z
  .object({
    services: z
      .array(z.enum(SERVICE_SLUGS))
      .min(1, "Kies minimaal één dienst."),
    finish: z.union([z.enum(FINISH_SLUGS), z.literal("")]),
    vehicle: z
      .string()
      .trim()
      .min(2, "Vul het merk en model van je auto in.")
      .max(120, "Houd merk en model korter dan 120 tekens."),
    name: z
      .string()
      .trim()
      .min(2, "Vul je naam in.")
      .max(100, "Houd je naam korter dan 100 tekens."),
    email: z
      .string()
      .trim()
      .max(160, "Dit e-mailadres is te lang.")
      .refine((v) => v === "" || EMAIL_RE.test(v), "Dit e-mailadres lijkt niet te kloppen."),
    phone: z
      .string()
      .trim()
      .max(30, "Dit telefoonnummer is te lang.")
      .refine(
        (v) => v === "" || (/^[+()\d\s-]+$/.test(v) && v.replace(/\D/g, "").length >= 9),
        "Dit telefoonnummer lijkt niet te kloppen.",
      ),
    message: z.string().trim().max(2000, "Houd de toelichting korter dan 2000 tekens."),
    preferredDate: z
      .string()
      .trim()
      .refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), "Kies een geldige datum.")
      .refine((v) => v === "" || v >= todayIso(), "Kies een datum vanaf vandaag."),
  })
  .superRefine((data, ctx) => {
    if (data.email === "" && data.phone === "") {
      ctx.addIssue({
        code: "custom",
        path: ["contact"],
        message: "Vul een e-mailadres of telefoonnummer in, zodat we je kunnen bereiken.",
      });
    }
  });

export type ValidQuote = z.infer<typeof schema>;

export function validateQuote(fields: QuoteFields):
  | { ok: true; data: ValidQuote }
  | { ok: false; errors: QuoteErrors } {
  const result = schema.safeParse(fields);
  if (result.success) return { ok: true, data: result.data };
  const errors: QuoteErrors = {};
  for (const issue of result.error.issues) {
    const key = (issue.path[0] ?? "contact") as QuoteFieldName;
    if (!errors[key]) {
      errors[key] =
        key === "services" && issue.code !== "too_small" ? "Kies een dienst uit de lijst." : issue.message;
    }
  }
  return { ok: false, errors };
}

export function fieldsFromFormData(fd: FormData): QuoteFields {
  const str = (k: string) => {
    const v = fd.get(k);
    return typeof v === "string" ? v : "";
  };
  return {
    services: fd.getAll("services").filter((v): v is string => typeof v === "string"),
    finish: str("finish"),
    vehicle: str("vehicle"),
    name: str("name"),
    email: str("email"),
    phone: str("phone"),
    message: str("message"),
    preferredDate: str("preferredDate"),
  };
}

export { todayIso };
