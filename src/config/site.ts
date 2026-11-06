/**
 * CENTRALE BEDRIJFSGEGEVENS
 *
 * Pas alles hier aan. Velden die leeg blijven ("" of []) worden nergens
 * op de site getoond, ook niet in de zoekmachine-gegevens.
 */
export const site = {
  /** Bedrijfsnaam zoals die overal op de site staat. */
  name: "Kavro",

  /** Woordmerk (licht, transparante achtergrond), bijgesneden tot de letters. */
  logo: { src: "/media/brand/kavro.png", width: 800, height: 134 },

  /**
   * Publieke URL zonder slash aan het eind. Basis voor metadataBase (og:image,
   * twitter:image, canonical), sitemap en robots. Zet NEXT_PUBLIC_SITE_URL bij je
   * hostingpartij; zonder die variabele valt hij terug op het live Vercel-domein.
   */
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://kavrov.vercel.app").replace(/\/$/, ""),

  contact: {
    email: "", // bijv. "info@kavro.nl"
    phone: "", // bijv. "+31 6 12345678" (wordt ook als tel:-link gebruikt)
    whatsapp: "", // internationaal zonder + of spaties, bijv. "31612345678"
  },

  /** Alleen invullen als bezoekers hier echt naartoe kunnen komen. */
  address: {
    street: "",
    postalCode: "",
    city: "",
  },

  /** Bijv. "Haarlem en omgeving". Leeg = niet tonen. */
  serviceArea: "",

  /** Bijv. [{ days: "Ma t/m vr", hours: "09:00 - 17:30" }] */
  openingHours: [] as { days: string; hours: string }[],

  socials: {
    instagram: "", // volledige URL
    tiktok: "",
    facebook: "",
    youtube: "",
  },

  /** KvK-nummer, wordt in de footer getoond als ingevuld. */
  kvk: "",
} as const;

export const socialLabels: Record<keyof typeof site.socials, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
  youtube: "YouTube",
};

export function filledSocials() {
  return (Object.keys(site.socials) as (keyof typeof site.socials)[])
    .filter((key) => site.socials[key].trim() !== "")
    .map((key) => ({ key, label: socialLabels[key], href: site.socials[key] }));
}

export function hasAddress() {
  const a = site.address;
  return a.street.trim() !== "" && a.city.trim() !== "";
}

export function hasAnyContact() {
  return (
    site.contact.email.trim() !== "" ||
    site.contact.phone.trim() !== "" ||
    site.contact.whatsapp.trim() !== ""
  );
}

export function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
