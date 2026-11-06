"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from "motion/react";

/** Basissnelheid: de helft van de band (één volledige set) per 38 s, zoals voorheen. */
const BASE = 50 / 38; // procent van de band per seconde
const MAX_BOOST = 2.5; // maximaal extra veelvoud bij snel scrollen
const MAX_SKEW = 3.5; // graden

/**
 * Lopende band met diensten. Snelheid reageert licht op hoe snel je scrolt
 * (useScroll → useVelocity → useSpring), met een kleine skew alsof de band meetrekt.
 * Bij "minder beweging": gewone constante snelheid, geen skew.
 */
export function Marquee({ words }: { words: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const reduce = useReducedMotion();

  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const boost = useTransform(velocity, (v) => Math.min(Math.abs(v) / 1000, MAX_BOOST));
  const skew = useTransform(velocity, [-2000, 0, 2000], [MAX_SKEW, 0, -MAX_SKEW]);

  const progress = useMotionValue(0);
  const x = useTransform(progress, (v) => `${wrap(-50, 0, v)}%`);
  const skewX = useMotionValue(0);

  // Laatste waarden via refs, zodat de frame-callback nooit met verouderde waarden rekent.
  const live = useRef({ inView, reduce });
  useEffect(() => {
    live.current = { inView, reduce };
  }, [inView, reduce]);

  useAnimationFrame((_, delta) => {
    const { inView: visible, reduce: calm } = live.current;
    if (!visible) return;
    const factor = 1 + (calm ? 0 : boost.get());
    progress.set(progress.get() - BASE * factor * (delta / 1000));
    skewX.set(calm ? 0 : skew.get());
  });

  return (
    <div ref={ref} aria-hidden="true" className="relative overflow-hidden border-y border-line bg-graphite py-5">
      <motion.div className="flex w-max will-change-transform" style={{ x, skewX }}>
        {[0, 1].map((n) => (
          <div key={n} className="flex shrink-0 items-center">
            {words.map((w) => (
              <span key={w} className="flex items-center">
                <span className="display px-8 text-[28px] text-paper/85 md:text-[34px]">{w}</span>
                <span className="h-2 w-2 rotate-45 bg-accent" />
              </span>
            ))}
          </div>
        ))}
      </motion.div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-graphite to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-graphite to-transparent" />
    </div>
  );
}
