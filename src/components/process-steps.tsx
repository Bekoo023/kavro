"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";

/**
 * Werkwijze als verticale tijdlijn. Tussen de stapnummers loopt een lijn die zich vult
 * terwijl je scrolt (scaleY, origin top), als een rakel die stap voor stap doortrekt.
 * Een stapnummer licht op zodra de lijn hem heeft bereikt. Elke stap volgt zijn eigen
 * scrollpositie langs een lijn op 60% van het scherm, zodat lijn en nummer altijd kloppen.
 * Bij "minder beweging": lijn volledig, alle nummers aan.
 */
export function ProcessSteps({ steps }: { steps: { title: string; text: string }[] }) {
  const reduce = useReducedMotionSafe();
  return (
    <ol className="relative">
      {steps.map((s, i) => (
        <Step key={s.title} step={s} index={i} isLast={i === steps.length - 1} reduce={reduce} />
      ))}
    </ol>
  );
}

function Step({
  step,
  index,
  isLast,
  reduce,
}: {
  step: { title: string; text: string };
  index: number;
  isLast: boolean;
  reduce: boolean;
}) {
  const ref = useRef<HTMLLIElement>(null);
  // 0 = bovenkant van de stap op 60% van het scherm, 1 = onderkant (= volgend nummer) daar.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 60%", "end 60%"] });
  const [reached, setReached] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (v) => setReached(v > 0));

  const lit = reduce || reached;

  return (
    <li ref={ref} className="relative grid grid-cols-[48px_1fr] gap-x-6 pb-12 last:pb-0 md:grid-cols-[56px_1fr] md:gap-x-10 md:pb-16">
      {!isLast && (
        // Segment van het midden van dit nummer tot het midden van het volgende.
        <span aria-hidden="true" className="absolute top-6 -bottom-6 left-6 w-px -translate-x-1/2 bg-line-strong md:top-7 md:-bottom-7 md:left-7">
          <motion.span
            className="absolute inset-0 origin-top bg-accent"
            style={{ scaleY: reduce ? 1 : scrollYProgress }}
          />
        </span>
      )}
      <span
        aria-hidden="true"
        className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border font-display text-[20px] font-semibold tabular-nums transition-colors duration-300 motion-reduce:transition-none md:h-14 md:w-14 md:text-[22px] ${
          lit ? "border-accent bg-accent text-ink" : "border-line-strong bg-ink text-mute-2"
        }`}
      >
        {index + 1}
      </span>
      <div className="pt-1 md:pt-2">
        <span className="text-[14px] text-mute-2 tabular-nums">Stap {index + 1}</span>
        <h3 className="display mt-2 text-[30px]">{step.title}</h3>
        <p className="mt-3 max-w-[48ch] text-[15px] text-mute">{step.text}</p>
      </div>
    </li>
  );
}
