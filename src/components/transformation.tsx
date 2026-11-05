"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { PhotoSequence } from "@/config/media";

/**
 * Scroll-gestuurde "transformatie": de sectie plakt vast terwijl je scrolt.
 * Links de stappen met een verticale voortgangslijn, rechts de foto in een kaart
 * met een loep op de raamlijst. De foto's vloeien in elkaar over (chroom → deels →
 * satijnzwart) terwijl de kaart rustig inzoomt.
 *
 * Alles hangt aan één waarde p (0..1). We lezen alleen de scrollpositie en zetten
 * transformaties, dus native scroll blijft intact. Bij "minder beweging": statisch eindbeeld.
 */

const STEPS = [
  { title: "Origineel chroom", text: "Glimmende lijsten rond de ramen, zoals de auto uit de fabriek komt." },
  { title: "Folie op maat", text: "Lijst voor lijst bekleed met folie, strak tot in de hoeken." },
  { title: "Satijnzwart", text: "Een rustige, strakke uitstraling. Het origineel blijft eronder bewaard." },
];
const BADGES = ["Origineel chroom", "In bewerking", "Satijnzwart"];

const ZOOM = 1.12;
/** Loep: waar hij op inzoomt (fractie van de foto) en hoe breed de foto erin is. */
const LOUPE = { x: 0.65, y: 0.745, width: 1300 };

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

export function Transformation({ sequence }: { sequence: PhotoSequence }) {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const camRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [step, setStep] = useState(0);
  const steps = sequence.frames.length - 1;

  useEffect(() => {
    const section = sectionRef.current;
    const card = cardRef.current;
    const cam = camRef.current;
    const bar = barRef.current;
    if (!section || !card || !cam || !bar) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const frames = Array.from(section.querySelectorAll<HTMLElement>("[data-frame]"));
    let raf = 0;
    let lastP = -1;

    const progress = () => {
      if (reduce.matches) return 1;
      const rect = section.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      return travel > 0 ? clamp(-rect.top / travel) : 0;
    };

    const apply = (p: number) => {
      // Kaart schuift in en kantelt licht recht terwijl de sectie binnenkomt.
      const rect = section.getBoundingClientRect();
      const enter = reduce.matches ? 1 : smooth(clamp(1 - rect.top / window.innerHeight));
      card.style.transform = `translateY(${((1 - enter) * 60).toFixed(1)}px) scale(${(0.94 + enter * 0.06).toFixed(4)}) rotate(${((1 - enter) * -1.5).toFixed(2)}deg)`;
      card.style.opacity = (0.3 + enter * 0.7).toFixed(3);

      const zoom = reduce.matches ? 1 : 1 + (ZOOM - 1) * smooth(clamp(p / 0.9));
      cam.style.transform = `scale(${zoom.toFixed(4)})`;

      const t = clamp((p - 0.12) / 0.66);
      frames.forEach((el) => {
        const i = Number(el.dataset.frame);
        el.style.opacity = smooth(clamp(t * steps - (i - 1))).toFixed(3);
      });
      bar.style.transform = `scaleY(${t.toFixed(4)})`;
      setStep(t < 0.25 ? 0 : t < 0.75 ? 1 : 2);
    };

    const tick = () => {
      raf = 0;
      const p = progress();
      if (Math.abs(p - lastP) < 0.0005 && p > 0) return;
      lastP = p;
      apply(p);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const reset = () => {
      lastP = -1;
      schedule();
    };

    reset();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", reset);
    reduce.addEventListener("change", reset);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", reset);
      reduce.removeEventListener("change", reset);
    };
  }, [steps]);

  const [first, ...rest] = sequence.frames;
  const fx = sequence.focus?.x ?? 0.5;
  const fy = sequence.focus?.y ?? 0.6;
  const loupeH = (LOUPE.width * sequence.height) / sequence.width;

  return (
    <section
      ref={sectionRef}
      id="afwerking"
      aria-labelledby="afwerking-titel"
      className="relative h-[300svh] border-y border-line bg-graphite motion-reduce:h-auto"
    >
      <div className="sticky top-0 flex h-svh items-center overflow-hidden motion-reduce:relative">
        <div className="wrap grid w-full items-center gap-6 pt-[var(--header-h)] lg:grid-cols-12 lg:gap-12">
          {/* Tekst en stappen */}
          <div className="lg:col-span-4">
            <h2 id="afwerking-titel" className="display text-[36px] md:text-[48px] lg:text-[56px]">
              Van chroom naar <span className="text-chrome">satijnzwart</span>
            </h2>
            <p className="mt-4 hidden max-w-[38ch] text-[15px] text-mute md:block">
              Zo ziet chrome delete eruit. Alleen de lijsten rond de ramen worden zwart, lak en glas blijven zoals ze zijn.
            </p>

            <div className="relative mt-6 pl-6 md:mt-10">
              <span aria-hidden="true" className="absolute top-1 bottom-1 left-0 w-px bg-line-strong" />
              <span
                ref={barRef}
                aria-hidden="true"
                className="absolute top-1 bottom-1 left-0 w-px origin-top bg-accent shadow-[0_0_10px_var(--color-accent)]"
                style={{ transform: "scaleY(0)" }}
              />
              <ol className="space-y-5 md:space-y-7">
                {STEPS.map((s, i) => (
                  <li
                    key={s.title}
                    aria-current={i === step ? "step" : undefined}
                    className={`relative transition-opacity duration-500 ${i === step ? "opacity-100" : "opacity-40 max-md:hidden"}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute top-[7px] -left-[28px] h-[9px] w-[9px] rounded-full border transition-colors duration-500 ${
                        i <= step ? "border-accent bg-accent" : "border-line-strong bg-graphite"
                      }`}
                    />
                    <p className="font-display text-[13px] font-semibold tracking-[0.16em] text-mute-2 tabular-nums">Stap {i + 1}</p>
                    <h3 className="mt-1 text-[19px] font-semibold md:text-[21px]">{s.title}</h3>
                    <p className="mt-1 max-w-[36ch] text-[14px] text-mute md:text-[15px]">{s.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Beeld in een kaart, met loep op de raamlijst */}
          <div className="relative lg:col-span-8">
            <div
              ref={cardRef}
              className="relative aspect-[4/3] overflow-hidden rounded-[24px] border border-line-strong bg-ink shadow-[0_40px_80px_-30px_rgb(0_0_0/0.8)] will-change-transform sm:aspect-[16/10] md:rounded-[32px]"
            >
              <div ref={camRef} className="absolute inset-0 will-change-transform" style={{ transformOrigin: `${fx * 100}% ${fy * 100}%` }}>
                <Image
                  src={first.src}
                  alt={sequence.frames[step]?.alt ?? first.alt}
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover object-[55%_85%]"
                />
                {rest.map((f, i) => (
                  <div key={f.src} data-frame={i + 1} className="absolute inset-0" style={{ opacity: 0 }} aria-hidden="true">
                    <Image src={f.src} alt="" fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover object-[55%_85%]" />
                  </div>
                ))}
              </div>
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />

              <span className="chip absolute top-4 left-4 !text-paper md:top-5 md:left-5" aria-live="polite">
                <span
                  className={`h-2 w-2 rounded-full transition-colors duration-500 ${
                    step === 0 ? "bg-gradient-to-br from-white to-[#8d9296]" : step === 1 ? "bg-mute-2" : "bg-[#151617] ring-1 ring-line-strong"
                  }`}
                />
                {BADGES[step]}
              </span>
              <span className="chip absolute top-4 right-4 tabular-nums md:top-5 md:right-5">
                {step + 1} / {STEPS.length}
              </span>
            </div>

            {/* Loep: zelfde reeks, ingezoomd op de achterste raamlijst */}
            <div
              aria-hidden="true"
              className="absolute -bottom-6 -left-4 hidden h-[170px] w-[170px] overflow-hidden rounded-full border border-line-strong bg-ink shadow-[0_20px_50px_-10px_rgb(0_0_0/0.9)] ring-4 ring-graphite md:block lg:-left-10 lg:h-[200px] lg:w-[200px]"
            >
              <div className="absolute" style={{ width: LOUPE.width, height: loupeH, left: `calc(50% - ${LOUPE.x * LOUPE.width}px)`, top: `calc(50% - ${LOUPE.y * loupeH}px)` }}>
                <Image src={first.src} alt="" fill sizes={`${LOUPE.width}px`} className="object-cover" />
                {rest.map((f, i) => (
                  <div key={f.src} data-frame={i + 1} className="absolute inset-0" style={{ opacity: 0 }}>
                    <Image src={f.src} alt="" fill sizes={`${LOUPE.width}px`} className="object-cover" />
                  </div>
                ))}
              </div>
              <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,rgb(255_255_255/0.18),transparent_45%)]" />
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-ink/80 px-2.5 py-0.5 text-[11px] tracking-[0.14em] text-mute uppercase">
                Detail
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
