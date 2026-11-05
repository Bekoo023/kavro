import Image from "next/image";
import type { ReactNode } from "react";
import type { HeroVideo } from "@/config/media";

/**
 * Schermvullende hero met achtergrondvideo. Zonder video (of bij "minder
 * beweging") staat de poster-foto er, met een trage zoom zodat het beeld leeft.
 * De inhoud komt bij het laden gestaffeld binnen via CSS (.intro-*).
 */
export function Hero({ video, children }: { video: HeroVideo; children: ReactNode }) {
  return (
    <section aria-label="Introductie" className="relative -mt-[var(--header-h)] flex min-h-svh flex-col overflow-hidden">
      <div aria-hidden={video.src ? true : undefined} className="absolute inset-0">
        <Image
          src={video.poster.src}
          alt={video.src ? "" : video.poster.alt}
          fill
          preload
          sizes="100vw"
          className={`object-cover ${video.src ? "" : "animate-kenburns object-bottom motion-reduce:animate-none"}`}
        />
        {video.src && (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={video.poster.src}
            className="intro-video absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
          >
            {video.mobileSrc && <source src={video.mobileSrc} type="video/mp4" media="(max-width: 767px)" />}
            <source src={video.src} type="video/mp4" />
          </video>
        )}
      </div>

      {/* Overlays: leesbaarheid van de tekst en een zachte overgang naar de pagina. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-ink/30" />
        <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-ink/90 via-ink/50 to-transparent lg:w-[70%]" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-ink via-ink/70 to-transparent" />
      </div>

      <div className="wrap relative z-10 flex flex-1 flex-col justify-end pt-[calc(var(--header-h)+48px)] pb-14 md:pb-20 lg:pb-24">
        {children}
      </div>

      <div
        aria-hidden="true"
        className="intro-fade absolute right-[max(20px,calc((100vw-1440px)/2+64px))] bottom-14 hidden flex-col items-center gap-3 text-[11px] tracking-[0.3em] text-mute-2 uppercase [writing-mode:vertical-rl] md:flex lg:bottom-24"
        style={{ "--d": "1300ms" } as React.CSSProperties}
      >
      </div>
    </section>
  );
}
