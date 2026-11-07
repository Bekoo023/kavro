"use client";

import { useId, useRef, useState } from "react";
import { serviceName } from "@/config/services";
import type { Project } from "@/lib/storage/types";

export function PortfolioGrid({ projects }: { projects: Project[] }) {
  return (
    <ul className="grid gap-x-6 gap-y-14 md:grid-cols-12">
      {projects.map((p, i) => (
        <li key={p.id} className={"reveal " + (i % 3 === 0 ? "md:col-span-12" : "md:col-span-6")}>
          <ProjectMedia project={p} />
          <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h3 className="display text-[30px] md:text-[36px]">{p.title}</h3>
            <p className="text-[14px] text-mute-2">
              {[p.vehicle, p.service ? serviceName(p.service) : null].filter(Boolean).join(" · ")}
            </p>
          </div>
          {p.description && <p className="mt-2 max-w-[60ch] text-mute">{p.description}</p>}
        </li>
      ))}
    </ul>
  );
}

function ProjectMedia({ project: p }: { project: Project }) {
  const frame = "relative w-full overflow-hidden rounded-[20px] border border-line bg-graphite";
  const style = { aspectRatio: p.aspect.replace("/", " / ") };

  if (p.type === "voor-na" && p.beforeSrc && p.afterSrc) {
    return <BeforeAfter before={p.beforeSrc} after={p.afterSrc} alt={p.imageAlt || p.title} aspect={style} />;
  }
  if (p.type === "video" && p.videoSrc) {
    return <LazyVideo src={p.videoSrc} poster={p.imageSrc} label={p.imageAlt || p.title} aspect={style} />;
  }
  if (p.imageSrc) {
    return (
      <div className={frame} style={style}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.imageSrc} alt={p.imageAlt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      </div>
    );
  }
  return null;
}

/** Video laadt pas na een klik en speelt met bediening. */
function LazyVideo({
  src,
  poster,
  label,
  aspect,
}: {
  src: string;
  poster: string | null;
  label: string;
  aspect: React.CSSProperties;
}) {
  const [active, setActive] = useState(false);
  return (
    <div className="relative w-full overflow-hidden rounded-[20px] border border-line bg-graphite" style={aspect}>
      {active ? (
        <video src={src} controls autoPlay playsInline preload="metadata" className="absolute inset-0 h-full w-full bg-black object-contain">
          Je browser kan deze video niet afspelen.
        </video>
      ) : (
        <button type="button" onClick={() => setActive(true)} className="group absolute inset-0 h-full w-full" aria-label={`Speel video af: ${label}`}>
          {poster && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={poster} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          )}
          <span className="absolute bottom-4 left-4 inline-flex min-h-[44px] items-center gap-3 rounded-full bg-paper px-5 text-[15px] font-medium text-ink transition-colors group-hover:bg-accent">
            <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true">
              <path d="M0 0 L12 7 L0 14 Z" fill="currentColor" />
            </svg>
            Speel video af
          </span>
        </button>
      )}
    </div>
  );
}

/**
 * Voor/na-vergelijking met twee uitgelijnde beelden. Een native range-input
 * doet het werk: slepen, tikken en pijltjestoetsen werken overal.
 */
export function BeforeAfter({
  before,
  after,
  alt,
  aspect,
}: {
  before: string;
  after: string;
  alt: string;
  aspect: React.CSSProperties;
}) {
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);
  const id = useId();

  const fromPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos(Math.round(Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100))));
  };

  return (
    <div
      className="relative w-full cursor-ew-resize touch-pan-y overflow-hidden rounded-[20px] border border-line bg-graphite select-none has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-silver-bright"
      style={aspect}
      onPointerDown={(e) => {
        if (e.pointerType === "mouse") e.preventDefault(); // voorkomt dat de browser de afbeelding gaat slepen
        e.currentTarget.setPointerCapture(e.pointerId);
        dragging.current = true;
        fromPointer(e);
      }}
      onPointerMove={(e) => dragging.current && fromPointer(e)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={after} alt={`Na: ${alt}`} draggable={false} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={before} alt={`Voor: ${alt}`} draggable={false} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      </div>
      <div className="pointer-events-none absolute inset-y-0 w-px bg-paper" style={{ left: `${pos}%` }} aria-hidden="true">
        <span className="absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-paper bg-ink/80 text-paper">
          <svg width="18" height="10" viewBox="0 0 18 10" aria-hidden="true">
            <path d="M5 1 L1 5 L5 9 M13 1 L17 5 L13 9" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </span>
      </div>
      <span className="pointer-events-none absolute top-3 left-3 rounded-full bg-ink/85 px-3 py-1 text-[13px]">Voor</span>
      <span className="pointer-events-none absolute top-3 right-3 rounded-full bg-ink/85 px-3 py-1 text-[13px]">Na</span>
      <label htmlFor={id} className="sr-only">
        Schuif om voor en na te vergelijken
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={1}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-valuetext={`${pos}% voor`}
        className="sr-only"
      />
    </div>
  );
}
