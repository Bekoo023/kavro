"use client";

import Link from "next/link";
import { createContext, useContext, useId, useState, type ReactNode } from "react";
import { Arrow } from "@/components/arrow";
import { DEFAULT_TINT, quoteHref, TINTS, type Tint } from "@/config/services";
import { tintMask } from "@/config/tint-mask";

/**
 * Tintkiezer voor de Window Tinting-kaart. De provider deelt de gekozen tint tussen
 * de overlay op de foto, de kiezer zelf en de offerte-link.
 */

const TintContext = createContext<{ tint: Tint; setTint: (t: Tint) => void } | null>(null);

function useTint() {
  const ctx = useContext(TintContext);
  if (!ctx) throw new Error("Tint-onderdelen moeten binnen <TintProvider> staan.");
  return ctx;
}

export function TintProvider({ initial = DEFAULT_TINT, children }: { initial?: Tint; children: ReactNode }) {
  const [tint, setTint] = useState<Tint>(initial);
  return <TintContext.Provider value={{ tint, setTint }}>{children}</TintContext.Provider>;
}

/**
 * De ruiten in de foto zijn al zeer donker (~5%). Lichtere tinten simuleren we daarom
 * door het glas op te lichten (grijs vlak met `screen`), de donkerste door het iets te
 * verdiepen. Beide lagen animeren alleen hun opacity.
 */
const LOOK: Record<Tint, { lift: number; deepen: number }> = {
  50: { lift: 0.42, deepen: 0 },
  35: { lift: 0.28, deepen: 0 },
  20: { lift: 0.14, deepen: 0 },
  5: { lift: 0, deepen: 0.4 },
};

export function TintOverlay() {
  const { tint } = useTint();
  const id = useId().replace(/:/g, "");
  const look = LOOK[tint];
  const layer = "transition-opacity duration-300 ease-[var(--ease-soft)] motion-reduce:transition-none";

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${tintMask.width} ${tintMask.height}`}
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <defs>
        <filter id={`${id}-soft`}>
          <feGaussianBlur stdDeviation="2" />
        </filter>
        <mask id={`${id}-glass`} maskUnits="userSpaceOnUse" x="0" y="0" width={tintMask.width} height={tintMask.height}>
          <rect width="100%" height="100%" fill="black" />
          <g filter={`url(#${id}-soft)`} fill="white">
            {tintMask.paths.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
        </mask>
      </defs>
      <g mask={`url(#${id}-glass)`}>
        <rect width="100%" height="100%" fill="#aeb4b9" className={layer} style={{ opacity: look.lift, mixBlendMode: "screen" }} />
        <rect width="100%" height="100%" fill="#000" className={layer} style={{ opacity: look.deepen }} />
      </g>
    </svg>
  );
}

const NOTE_ID = "tint-advies";

/** Segmented control met echte radio's: pijltjestoetsen wisselen, Tab springt de groep in/uit. */
export function TintPicker() {
  const { tint, setTint } = useTint();
  const name = useId();

  return (
    <fieldset className="absolute inset-x-3 bottom-3" aria-describedby={NOTE_ID}>
      <legend className="sr-only">Lichtdoorlatendheid van de achterste ruiten</legend>
      <div className="relative grid grid-cols-4 rounded-full border border-line-strong bg-ink/90 p-1 shadow-[0_10px_30px_-10px_rgb(0_0_0/0.8)]">
        {TINTS.map((t) => (
          <label
            key={t}
            className="relative flex min-h-10 cursor-pointer items-center justify-center rounded-full text-[14px] text-mute tabular-nums transition-colors duration-200 hover:text-paper has-[:checked]:bg-paper has-[:checked]:font-semibold has-[:checked]:text-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent motion-reduce:transition-none"
          >
            <input
              type="radio"
              name={name}
              value={t}
              checked={tint === t}
              onChange={() => setTint(t)}
              className="sr-only"
            />
            {t}%
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function TintNote() {
  return (
    <p id={NOTE_ID} className="mt-4 text-[13px] leading-snug text-mute-2">
      In Nederland mogen de voorruit en voorste zijruiten niet zomaar getint worden. We adviseren je vooraf.
    </p>
  );
}

export function TintQuoteLink({ children }: { children: ReactNode }) {
  const { tint } = useTint();
  return (
    <Link href={quoteHref({ service: "window-tinting", tint })} className="link-line mt-auto self-start pt-4 text-[15px]">
      {children}
      <Arrow />
    </Link>
  );
}
