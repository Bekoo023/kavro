import "server-only";
import { site } from "@/config/site";
import { finishes, services } from "@/config/services";
import type { QuoteRequest } from "@/lib/storage/types";

/**
 * Optionele e-mailmelding via Resend (https://resend.com), zonder extra SDK.
 * Nodig: RESEND_API_KEY, MAIL_FROM (geverifieerd domein) en MAIL_TO.
 * Ontbreekt dit, dan wordt de aanvraag alleen opgeslagen en is hij zichtbaar in /beheer.
 */
export function mailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM && process.env.MAIL_TO);
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export async function notifyNewRequest(r: QuoteRequest): Promise<"sent" | "skipped" | "failed"> {
  if (!mailConfigured()) return "skipped";

  const rows: [string, string][] = [
    ["Dienst", r.services.map((s) => services[s].name).join(", ")],
    ...(r.finish ? [["Afwerking", finishes[r.finish].name] as [string, string]] : []),
    ["Auto", r.vehicle],
    ["Naam", r.name],
    ["E-mail", r.email ?? "-"],
    ["Telefoon", r.phone ?? "-"],
    ["Voorkeursdatum", r.preferredDate ?? "-"],
    ["Toelichting", r.message ?? "-"],
  ];
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  const html = `<table cellpadding="6" style="font-family:sans-serif;font-size:14px">${rows
    .map(([k, v]) => `<tr><td style="color:#666;vertical-align:top">${k}</td><td>${escapeHtml(v).replace(/\n/g, "<br>")}</td></tr>`)
    .join("")}</table>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM,
        to: process.env.MAIL_TO!.split(",").map((s) => s.trim()),
        reply_to: r.email ?? undefined,
        subject: `Nieuwe aanvraag: ${r.vehicle} (${site.name})`,
        text,
        html,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error("[mail] Resend gaf status", res.status, await res.text().catch(() => ""));
      return "failed";
    }
    return "sent";
  } catch (err) {
    console.error("[mail] Versturen mislukt:", err);
    return "failed";
  }
}
