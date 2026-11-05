export const SERVICE_SLUGS = ["ppf", "chrome-delete", "window-tinting"] as const;
export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

export const FINISH_SLUGS = ["satijnzwart", "origineel-chroom"] as const;
export type FinishSlug = (typeof FINISH_SLUGS)[number];

export const services: Record<
  ServiceSlug,
  { slug: ServiceSlug; name: string; short: string; summary: string; detail: string; points: string[] }
> = {
  ppf: {
    slug: "ppf",
    name: "Paint Protection Film",
    short: "PPF",
    summary: "Een transparante folie die de lak helpt beschermen tegen steenslag en krassen.",
    detail: "Geschikt voor de delen die het meest te verduren krijgen, zoals de voorkant, spiegels en instaplijsten.",
    points: ["Voorbumper, motorkap en spatborden", "Spiegelkappen en instaplijsten", "Transparant: de kleur van je lak blijft zichtbaar"],
  },
  "chrome-delete": {
    slug: "chrome-delete",
    name: "Chrome Delete",
    short: "Chrome delete",
    summary: "Geef de chromen lijsten rond je ramen een zwarte afwerking.",
    detail: "Met folie, dus de originele lijsten blijven eronder bewaard.",
    points: ["Raamomlijstingen en sierlijsten", "Strakke satijnzwarte afwerking", "Omkeerbaar: het origineel blijft eronder bewaard"],
  },
  "window-tinting": {
    slug: "window-tinting",
    name: "Window Tinting",
    short: "Window tinting",
    summary: "Kies een tint die past bij de uitstraling van je auto.",
    detail: "We bespreken vooraf welke ramen in aanmerking komen en welke tint je zoekt.",
    points: ["Achterste zijruiten en achterruit", "Van licht tot donker getint", "Vooraf advies over wat is toegestaan"],
  },
};

export const finishes: Record<FinishSlug, { slug: FinishSlug; name: string }> = {
  satijnzwart: { slug: "satijnzwart", name: "Satijnzwart" },
  "origineel-chroom": { slug: "origineel-chroom", name: "Origineel chroom" },
};

export function isServiceSlug(value: unknown): value is ServiceSlug {
  return typeof value === "string" && (SERVICE_SLUGS as readonly string[]).includes(value);
}

export function isFinishSlug(value: unknown): value is FinishSlug {
  return typeof value === "string" && (FINISH_SLUGS as readonly string[]).includes(value);
}

export function quoteHref(opts: { service?: ServiceSlug; finish?: FinishSlug } = {}) {
  const params = new URLSearchParams();
  if (opts.service) params.set("dienst", opts.service);
  if (opts.finish) params.set("afwerking", opts.finish);
  const qs = params.toString();
  return qs ? `/offerte?${qs}` : "/offerte";
}
