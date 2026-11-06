import { services } from "@/config/services";
import type { QuoteRequest } from "@/lib/storage/types";

/** "Golf 8 · Window tinting (Lisa Jansen)": titel/label voor een aanvraag in de agenda. */
export function requestLabel(r: QuoteRequest) {
  return `${r.vehicle} · ${r.services.map((s) => services[s]?.short ?? s).join(" + ")} (${r.name})`;
}
