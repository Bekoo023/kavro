"use client";

import { useId, useState } from "react";

/**
 * FAQ-accordion. Openen/sluiten animeert via grid-template-rows 0fr → 1fr (de enige
 * layout-animatie op de site), het plusje draait 45° naar een kruisje.
 * Knop met aria-expanded/aria-controls; het dichte paneel is `inert` (niet focusbaar,
 * niet voorgelezen). Bij "minder beweging": direct open/dicht.
 */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((f) => (
        <FaqItem key={f.q} q={f.q} a={f.a} />
      ))}
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const buttonId = `${id}-knop`;
  const panelId = `${id}-antwoord`;

  return (
    <div>
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full cursor-pointer items-center justify-between gap-6 py-6 text-left text-[18px] font-medium transition-colors hover:text-accent md:text-[20px]"
        >
          {q}
          <span
            aria-hidden="true"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[20px] leading-none transition-[transform,background-color,border-color,color] duration-300 ease-[var(--ease-soft)] motion-reduce:transition-none ${
              open ? "rotate-45 border-accent bg-accent text-ink" : "border-line-strong text-paper"
            }`}
          >
            +
          </span>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        inert={!open}
        className={`grid transition-[grid-template-rows] duration-300 ease-[var(--ease-soft)] motion-reduce:transition-none ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="max-w-[62ch] pb-7 text-mute">{a}</p>
        </div>
      </div>
    </div>
  );
}
