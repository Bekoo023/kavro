"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

/**
 * Eén lichtreflectie die schuin over de motorkap glijdt zodra de PPF-foto voor het
 * eerst goed in beeld is: zoals licht over verse, glasheldere folie trekt.
 * Speelt één keer (useInView once), niet in een loop. Bij "minder beweging": niets.
 */
export function PpfSheen() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Start links buiten beeld; altijd gerenderd (hydratie-veilig), alleen animeren zonder "minder beweging". */}
      <motion.div
        // `screen` i.p.v. overlay/soft-light: licht telt op, en op deze middengrijze lak
        // gaven overlay/soft-light (getest in Chrome) nauwelijks of geen zichtbaar effect.
        className="absolute inset-y-0 -left-full w-full mix-blend-screen"
        style={{
          background:
            "linear-gradient(105deg, transparent 40%, rgb(255 255 255 / 0.12) 46%, rgb(255 255 255 / 0.42) 50%, rgb(255 255 255 / 0.12) 54%, transparent 60%)",
        }}
        initial={{ x: "0%" }}
        animate={inView && !reduce ? { x: "200%" } : undefined}
        transition={{ duration: 1.5, delay: 0.15, ease: [0.45, 0, 0.2, 1] }}
      />
    </div>
  );
}
