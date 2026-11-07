"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";

/**
 * Werkwijze als verticale tijdlijn over de volle breedte: links het stapnummer op de lijn,
 * dan de titel, rechts de uitleg. De lijn vult zich terwijl je scrolt (scaleY, origin top),
 * als een rakel die stap voor stap doortrekt. Een stap licht op zodra de lijn hem bereikt;
 * stappen die nog komen staan gedempt. Bij "minder beweging": alles volledig zichtbaar.
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
  const fade = "transition-colors duration-500 motion-reduce:transition-none";

  return (
    <li ref={ref} className="relative grid grid-cols-[48px_minmax(0,1fr)] gap-x-6 md:grid-cols-[56px_minmax(0,1fr)] md:gap-x-10">
      {!isLast && (
        // Segment van het midden van dit nummer tot het midden van het volgende.
        <span aria-hidden="true" className="absolute top-6 -bottom-6 left-6 w-px -translate-x-1/2 bg-line-strong md:top-7 md:-bottom-7 md:left-7">
          <motion.span className="absolute inset-0 origin-top bg-accent" style={{ scaleY: reduce ? 1 : scrollYProgress }} />
        </span>
      )}
      <span
        aria-hidden="true"
        className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border font-display text-[20px] font-semibold tabular-nums md:h-14 md:w-14 md:text-[22px] ${fade} ${
          lit ? "border-accent bg-accent text-ink" : "border-line-strong bg-ink text-mute-2"
        }`}
      >
        {index + 1}
      </span>

      {/* Inhoud: op desktop titel en uitleg naast elkaar, gescheiden door een fijne lijn. */}
      <div className={`grid gap-3 pb-12 md:pb-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-10 ${isLast ? "!pb-0" : ""}`}>
        <div className="pt-1 md:pt-2">
          <span className={`text-[14px] tabular-nums ${fade} ${lit ? "text-accent" : "text-mute-2"}`}>Stap {index + 1}</span>
          <h3 className={`display mt-2 text-[34px] md:text-[44px] ${fade} ${lit ? "text-paper" : "text-mute-2"}`}>{step.title}</h3>
        </div>
        <p className={`max-w-[46ch] text-[16px] leading-relaxed lg:border-l lg:border-line lg:pt-3 lg:pl-10 md:text-[17px] ${fade} ${lit ? "text-mute" : "text-mute-2/70"}`}>
          {step.text}
        </p>
      </div>
    </li>
  );
}
