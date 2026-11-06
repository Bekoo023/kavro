import type { ServiceSlug } from "./services";

/**
 * VERVANGPUNT VOOR EIGEN BEELD
 *
 * Zolang een waarde `null` is, toont de site een illustratie in SVG.
 * Zet je eigen bestanden in /public/media en vul hier het pad in.
 * Componenten hoeven niet aangepast te worden.
 */

export type PhotoAsset = {
  src: string; // bijv. "/media/hero.jpg"
  alt: string;
  width: number; // pixelafmetingen van het bestand
  height: number;
  /** Optioneel inzoomen op een detail: schaal en middelpunt als fractie (0-1). */
  crop?: { scale: number; x: number; y: number };
};

/**
 * Achtergrond van de hero. Zet je video in /public/media/hero en vul `src` in,
 * bijv. "/media/hero/hero.mp4" (H.264 MP4, zonder geluid, liefst < 10 MB).
 * Zonder video, of bij "minder beweging", toont de hero de poster-foto.
 * `mobileSrc` is optioneel: een lichtere, staande uitsnede voor telefoons.
 */
export type HeroVideo = {
  src: string;
  mobileSrc?: string;
  poster: PhotoAsset;
};

/**
 * Fotoreeks voor de transformatie-sectie: dezelfde auto, exact even groot en
 * uitgelijnd, met de raamomlijsting stap voor stap van chroom naar satijnzwart.
 * Tijdens het scrollen vloeien de beelden in elkaar over terwijl de camera inzoomt.
 */
export type PhotoSequence = {
  /** Eerste beeld = origineel chroom, laatste = satijnzwart. Alle beelden even groot. */
  frames: { src: string; alt: string }[];
  width: number;
  height: number;
  /** Punt waarop de zoom eindigt, als fractie van de foto (0-1). Kies het midden van de zijruit. */
  focus?: { x: number; y: number };
};

/** View-transition-naam van een dienstbeeld; homepage-kaart en /offerte-kop delen deze. */
export const serviceImageTransition = (slug: ServiceSlug) => `dienst-beeld-${slug}`;

const HERO_ALT = "Grafietgrijze coupé in zijaanzicht voor een donkere betonwand";

export const media: {
  hero: HeroVideo;
  transformation: PhotoSequence | null;
  services: Record<ServiceSlug, PhotoAsset | null>;
} = {
  hero: {
    src: "/media/hero/hero.mp4",
    mobileSrc: "/media/hero/hero-mobile.mp4",
    poster: {
      src: "/media/hero/hero-poster.jpg",
      alt: "Close-up van glanzende zwarte lak met reflecties van studiolampen",
      width: 1920,
      height: 822,
    },
  },
  transformation: {
    frames: [
      { src: "/media/hero/chroom.png", alt: `${HERO_ALT}, met chromen raamlijsten` },
      { src: "/media/hero/half.png", alt: `${HERO_ALT}, achterste raamlijst in satijnzwart` },
      { src: "/media/hero/satijn.png", alt: `${HERO_ALT}, alle raamlijsten in satijnzwart` },
    ],
    width: 1672,
    height: 941,
    focus: { x: 0.52, y: 0.62 },
  },
  services: {
    ppf: {
      src: "/media/diensten/ppf.png",
      alt: "Transparante beschermfolie wordt met een rakel op een grafietgrijze motorkap aangebracht",
      width: 1484,
      height: 1060,
    },
    "chrome-delete": {
      src: "/media/diensten/chrome-delete.png",
      alt: "Satijnzwarte folie wordt over een chromen raamrand aangebracht",
      width: 1586,
      height: 992,
    },
    "window-tinting": {
      src: "/media/diensten/window-tinting.png",
      alt: "Getinte achterste zijruiten van een grafietgrijze sedan in een werkplaats",
      width: 1586,
      height: 992,
    },
  },
};
