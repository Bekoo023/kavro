/** Datum- en tijdhulpjes voor /beheer. Alles in Nederlandse tijd. */

const TZ = "Europe/Amsterdam";

export const fmtDateTime = new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium", timeStyle: "short", timeZone: TZ });
export const fmtDateLong = new Intl.DateTimeFormat("nl-NL", { weekday: "long", day: "numeric", month: "long", timeZone: TZ });
export const fmtDateShort = new Intl.DateTimeFormat("nl-NL", { weekday: "short", day: "numeric", month: "short", timeZone: TZ });
const ymdFmt = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: TZ });

/** YYYY-MM-DD van een moment, in Nederlandse tijd. */
export function ymd(date: Date = new Date()) {
  return ymdFmt.format(date);
}

/** Datum (YYYY-MM-DD) als Date op het middaguur, zodat tijdzones de dag niet verschuiven. */
export function fromYmd(day: string) {
  return new Date(`${day}T12:00:00`);
}

/** Aantal hele dagen tussen twee YYYY-MM-DD-datums (b - a). */
export function daysBetween(a: string, b: string) {
  return Math.round((fromYmd(b).getTime() - fromYmd(a).getTime()) / 86_400_000);
}

/** "vandaag", "gisteren", "3 dagen geleden" voor een ISO-moment. */
export function ago(iso: string, now = new Date()) {
  const d = daysBetween(ymd(new Date(iso)), ymd(now));
  if (d <= 0) return "vandaag";
  if (d === 1) return "gisteren";
  if (d < 7) return `${d} dagen geleden`;
  const w = Math.floor(d / 7);
  return w === 1 ? "1 week geleden" : `${w} weken geleden`;
}

/** "vandaag", "morgen", "over 3 dagen" voor een YYYY-MM-DD in de toekomst. */
export function until(day: string, today = ymd()) {
  const d = daysBetween(today, day);
  if (d === 0) return "vandaag";
  if (d === 1) return "morgen";
  if (d < 0) return d === -1 ? "gisteren" : `${-d} dagen geleden`;
  return `over ${d} dagen`;
}

const euroFmt = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" });

/** Centen → "€ 1.250,00". */
export function euro(cents: number) {
  return euroFmt.format(cents / 100);
}

/** Centen → invoerwaarde "1250,00" voor een prijsveld. */
export function euroInput(cents: number | null) {
  return cents === null ? "" : (cents / 100).toFixed(2).replace(".", ",");
}

/** Telefoonnummer naar wa.me-formaat (NL: 06 → 316). */
export function whatsappHref(phone: string) {
  let n = phone.replace(/[^\d+]/g, "");
  if (n.startsWith("+")) n = n.slice(1);
  else if (n.startsWith("00")) n = n.slice(2);
  else if (n.startsWith("0")) n = `31${n.slice(1)}`;
  return `https://wa.me/${n}`;
}
