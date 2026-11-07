import { serviceName, services } from "@/config/services";
import type { QuoteRequest } from "@/lib/storage/types";

/** "Golf 8 · Chrome delete (Lisa Jansen)": titel/label voor een aanvraag in de agenda. */
export function requestLabel(r: QuoteRequest) {
  return `${r.vehicle} · ${r.services.map((s) => services[s]?.short ?? serviceName(s)).join(" + ")} (${r.name})`;
}
