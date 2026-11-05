"use server";

import { isFinishSlug } from "@/config/services";
import { hasAnyContact, site } from "@/config/site";
import { notifyNewRequest } from "@/lib/mail";
import { fieldsFromFormData, validateQuote, type QuoteErrors, type QuoteFields } from "@/lib/quote-schema";
import { getStorage, StorageNotConfiguredError } from "@/lib/storage";

export type QuoteState =
  | { status: "idle" }
  | { status: "error"; fields: QuoteFields; errors: QuoteErrors; formError?: string }
  | { status: "success"; name: string; contact: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function fallbackContact() {
  const parts = [site.contact.phone && `bel ${site.contact.phone}`, site.contact.email && `mail ${site.contact.email}`].filter(Boolean);
  return hasAnyContact() && parts.length ? ` Je kunt ook ${parts.join(" of ")}.` : "";
}

export async function submitQuote(_prev: QuoteState, formData: FormData): Promise<QuoteState> {
  const fields = fieldsFromFormData(formData);

  // Spamval: echte bezoekers zien dit veld niet.
  if (String(formData.get("website") ?? "") !== "") {
    return { status: "success", name: "", contact: "" };
  }

  const submissionId = String(formData.get("submissionId") ?? "");
  if (!UUID_RE.test(submissionId)) {
    return {
      status: "error",
      fields,
      errors: {},
      formError: "Het formulier is verlopen. Vernieuw de pagina en probeer het opnieuw.",
    };
  }

  const result = validateQuote(fields);
  if (!result.ok) {
    return { status: "error", fields, errors: result.errors };
  }
  const d = result.data;
  const includesChromeDelete = d.services.includes("chrome-delete");

  try {
    const storage = await getStorage();
    const { request, duplicate } = await storage.createRequest({
      submissionId,
      services: d.services,
      finish: includesChromeDelete && isFinishSlug(d.finish) ? d.finish : null,
      vehicle: d.vehicle,
      name: d.name,
      email: d.email || null,
      phone: d.phone || null,
      message: d.message || null,
      preferredDate: d.preferredDate || null,
    });
    if (!duplicate) await notifyNewRequest(request);
    return { status: "success", name: d.name.split(" ")[0], contact: d.email || d.phone };
  } catch (err) {
    console.error("[offerte] Opslaan mislukt:", err);
    const formError =
      err instanceof StorageNotConfiguredError
        ? `Aanvragen kunnen op dit moment niet worden ontvangen, omdat de opslag van deze website nog niet is ingesteld. Je gegevens zijn niet verstuurd.${fallbackContact()}`
        : `Je aanvraag kon niet worden opgeslagen door een technische storing. Je gegevens zijn niet verstuurd. Probeer het over een paar minuten opnieuw.${fallbackContact()}`;
    return { status: "error", fields, errors: {}, formError };
  }
}
