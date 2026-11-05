import Image from "next/image";
import { site } from "@/config/site";

/** Woordmerk uit site.logo. Hoogte via className (bijv. "h-5"), breedte volgt automatisch. */
export function BrandLogo({ className = "", decorative = false, preload = false }: { className?: string; decorative?: boolean; preload?: boolean }) {
  return (
    <Image
      src={site.logo.src}
      alt={decorative ? "" : site.name}
      width={site.logo.width}
      height={site.logo.height}
      preload={preload}
      className={`w-auto select-none ${className}`}
    />
  );
}
