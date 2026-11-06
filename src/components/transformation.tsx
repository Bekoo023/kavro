"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from "react";
import {
  easeInOut,
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import type { PhotoSequence } from "@/config/media";

/**
 * "Van chroom naar satijnzwart": scroll-gestuurde onthulling.
 *
 * Desktop: de sectie is ~280svh hoog en de inhoud plakt vast. Scrollprogressie p (0..1)
 * stuurt een horizontale clip-path-wipe: chroom → half → satijn. De wipe loopt van rechts
 * naar links, net als het echte werk (de achterste lijst wordt eerst bekleed). Langs de
 * wiperand loopt een dunne lichtlijn, als de rakel die de folie aandrukt.
 * Mobiel (< lg): het beeld plakt bovenaan, de stappen scrollen eronder langs.
 * Bij "minder beweging": geen scrollkoppeling, je kiest zelf de stap.
 */

const STEPS = [
  { title: "Origineel chroom", text: "Glimmende lijsten rond de ramen, zoals de auto uit de fabriek komt." },
  { title: "Folie op maat", text: "Lijst voor lijst bekleed met folie, strak tot in de hoeken." },
  { title: "Satijnzwart", text: "Een rustige, strakke uitstraling. Het origineel blijft eronder bewaard." },
];
const BADGES = ["Origineel chroom", "In bewerking", "Satijnzwart"];

/** Waar in p (0..1) elke wipe loopt. Het midden valt op de stapgrens (1/3 en 2/3). */
const WIPES: [number, number][] = [
  [0.2, 0.46],
  [0.54, 0.8],
];
const ZOOM = 1.08;
const IMG_CLASS = "object-cover object-[55%_85%]";
const IMG_SIZES = "(min-width: 1024px) 60vw, 100vw";

const mid = ([a, b]: [number, number]) => (a + b) / 2;
const subscribeNoop = () => () => {};

export function Transformation({ sequence }: { sequence: PhotoSequence }) {
  // Eerste render (server + hydratie) is altijd de scrollvariant; daarna pas de voorkeur lezen.
  const hydrated = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const reduce = useReducedMotion();
  return hydrated && reduce ? <StepSwitcher sequence={sequence} /> : <ScrollReveal sequence={sequence} />;
}

/* ------------------------------------------------------------------ */
/* Scrollvariant                                                       */
/* ------------------------------------------------------------------ */

function ScrollReveal({ sequence }: { sequence: PhotoSequence }) {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const [step, setStep] = useState(0);

  // Desktop: progressie door de hele (vastplakkende) sectie.
  const { scrollYProgress: sectionP } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  // Mobiel: progressie van de stappenlijst langs een lijn op 70% van het scherm, onder het beeld.
  const { scrollYProgress: listP } = useScroll({ target: listRef, offset: ["start 70%", "end 70%"] });

  const isLg = useMotionValue(0);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => isLg.set(mq.matches ? 1 : 0);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [isLg]);

  const p = useTransform(() => (isLg.get() ? sectionP.get() : listP.get()));

  const wipe1 = useTransform(p, WIPES[0], [0, 1], { ease: easeInOut });
  const wipe2 = useTransform(p, WIPES[1], [0, 1], { ease: easeInOut });
  const zoom = useTransform(p, [0, 1], [1, ZOOM]);

  // Stap wisselt halverwege elke wipe (direct uit p, zodat hij nooit een frame achterloopt).
  useMotionValueEvent(p, "change", (v) => {
    setStep(v >= mid(WIPES[1]) ? 2 : v >= mid(WIPES[0]) ? 1 : 0);
  });

  const [first, half, last] = sequence.frames;

  return (
    <section
      ref={sectionRef}
      id="afwerking"
      aria-labelledby="afwerking-titel"
      className="relative border-y border-line bg-graphite lg:h-[280svh]"
    >
      <div className="lg:sticky lg:top-0 lg:flex lg:h-svh lg:items-center lg:overflow-hidden">
        <Layout
          stickyCard
          card={
            <Card step={step}>
              <motion.div className="absolute inset-0" style={{ scale: zoom, transformOrigin: focusOrigin(sequence) }}>
                <Image src={first.src} alt={sequence.frames[step]?.alt ?? first.alt} fill sizes={IMG_SIZES} className={IMG_CLASS} />
                {half && <WipeLayer src={half.src} progress={wipe1} />}
                {last && <WipeLayer src={last.src} progress={wipe2} />}
              </motion.div>
            </Card>
          }
          steps={
            <StepList listRef={listRef} step={step} bar={p} itemClassName="max-lg:min-h-[40svh]" />
          }
        />
      </div>
    </section>
  );
}

/** Eén beeldlaag die van rechts naar links wordt onthuld, met een rakellijn op de rand. */
function WipeLayer({ src, progress }: { src: string; progress: MotionValue<number> }) {
  const left = useTransform(progress, [0, 1], [100, 0]);
  const clipPath = useMotionTemplate`inset(0 0 0 ${left}%)`;
  const x = useMotionTemplate`${left}%`;
  const edge = useTransform(progress, [0, 0.04, 0.96, 1], [0, 1, 1, 0]);

  return (
    <>
      <motion.div aria-hidden="true" className="absolute inset-0 will-change-[clip-path]" style={{ clipPath }}>
        <Image src={src} alt="" fill sizes={IMG_SIZES} className={IMG_CLASS} />
      </motion.div>
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ x, opacity: edge }}>
        <span className="absolute inset-y-0 left-0 w-px -translate-x-1/2 bg-white/70 shadow-[0_0_14px_2px_rgb(255_255_255/0.35)]" />
      </motion.div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Variant zonder scrollkoppeling ("minder beweging")                  */
/* ------------------------------------------------------------------ */

function StepSwitcher({ sequence }: { sequence: PhotoSequence }) {
  const [step, setStep] = useState(0);
  return (
    <section id="afwerking" aria-labelledby="afwerking-titel" className="relative border-y border-line bg-graphite py-24 md:py-32">
      <Layout
        card={
          <Card step={step}>
            {sequence.frames.map((f, i) => (
              <div key={f.src} className={`absolute inset-0 ${i === step ? "" : "invisible"}`} aria-hidden={i === step ? undefined : true}>
                <Image src={f.src} alt={f.alt} fill sizes={IMG_SIZES} className={IMG_CLASS} />
              </div>
            ))}
          </Card>
        }
        steps={<StepList step={step} onSelect={setStep} />}
      />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Gedeelde opbouw                                                     */
/* ------------------------------------------------------------------ */

/** Desktop: kop + stappen links, beeld rechts. Mobiel: kop, beeld, stappen. */
function Layout({ card, steps, stickyCard = false }: { card: ReactNode; steps: ReactNode; stickyCard?: boolean }) {
  return (
    <div className="wrap grid w-full gap-8 pt-20 pb-16 lg:grid-cols-12 lg:grid-rows-[auto_auto] lg:items-center lg:gap-x-12 lg:gap-y-0 lg:py-0 lg:pt-[var(--header-h)]">
      <div className="lg:col-span-4 lg:self-end">
        <h2 id="afwerking-titel" className="display text-[36px] md:text-[48px] lg:text-[56px]">
          Van chroom naar <span className="text-chrome">satijnzwart</span>
        </h2>
        <p className="mt-4 hidden max-w-[38ch] text-[15px] text-mute md:block">
          Zo ziet chrome delete eruit. Alleen de lijsten rond de ramen worden zwart, lak en glas blijven zoals ze zijn.
        </p>
      </div>
      <div
        className={`self-start lg:col-span-8 lg:col-start-5 lg:row-span-2 lg:row-start-1 lg:self-center ${
          // Mobiel: beeld plakt onder de header; de effen strook erachter dekt de stappenlijn af.
          stickyCard
            ? "max-lg:sticky max-lg:top-[var(--header-h)] max-lg:z-10 max-lg:-mx-5 max-lg:bg-graphite max-lg:px-5 max-lg:py-3 md:max-lg:-mx-10 md:max-lg:px-10"
            : ""
        }`}
      >
        {card}
      </div>
      <div className="lg:col-span-4 lg:self-start lg:pt-10">{steps}</div>
    </div>
  );
}

function Card({ step, className = "", children }: { step: number; className?: string; children: ReactNode }) {
  return (
    <div
      className={`relative aspect-[4/3] overflow-hidden rounded-[24px] border border-line-strong bg-ink shadow-[0_40px_80px_-30px_rgb(0_0_0/0.8)] sm:aspect-[16/10] md:rounded-[32px] ${className}`}
    >
      {children}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
      <span className="chip absolute top-4 left-4 !text-paper md:top-5 md:left-5" aria-live="polite">
        <span
          className={`h-2 w-2 rounded-full transition-colors duration-500 motion-reduce:transition-none ${
            step === 0 ? "bg-gradient-to-br from-white to-[#8d9296]" : step === 1 ? "bg-mute-2" : "bg-[#151617] ring-1 ring-line-strong"
          }`}
        />
        {BADGES[step]}
      </span>
      <span className="chip absolute top-4 right-4 tabular-nums md:top-5 md:right-5">
        {step + 1} / {STEPS.length}
      </span>
    </div>
  );
}

function StepList({
  step,
  listRef,
  bar,
  onSelect,
  itemClassName = "",
}: {
  step: number;
  listRef?: RefObject<HTMLOListElement | null>;
  bar?: MotionValue<number>;
  onSelect?: (i: number) => void;
  itemClassName?: string;
}) {
  return (
    <div className="relative pl-6">
      <span aria-hidden="true" className="absolute top-1 bottom-1 left-0 w-px bg-line-strong" />
      {bar && (
        <motion.span
          aria-hidden="true"
          className="absolute top-1 bottom-1 left-0 w-px origin-top bg-accent shadow-[0_0_10px_var(--color-accent)]"
          style={{ scaleY: bar }}
        />
      )}
      <ol ref={listRef} className="space-y-5 md:space-y-7">
        {STEPS.map((s, i) => {
          const active = i === step;
          // In een knop mogen geen koppen; daar dezelfde opmaak met spans.
          const [Label, Title, Text] = onSelect ? (["span", "span", "span"] as const) : (["p", "h3", "p"] as const);
          const body = (
            <>
              <span
                aria-hidden="true"
                className={`absolute top-[7px] -left-[28px] h-[9px] w-[9px] rounded-full border transition-colors duration-500 motion-reduce:transition-none ${
                  i <= step ? "border-accent bg-accent" : "border-line-strong bg-graphite"
                }`}
              />
              <Label className="block font-display text-[13px] font-semibold tracking-[0.16em] text-mute-2 tabular-nums">Stap {i + 1}</Label>
              <Title className="mt-1 block text-[19px] font-semibold md:text-[21px]">{s.title}</Title>
              <Text className="mt-1 block max-w-[36ch] text-[14px] text-mute md:text-[15px]">{s.text}</Text>
            </>
          );
          return (
            <li
              key={s.title}
              aria-current={active ? "step" : undefined}
              className={`relative transition-opacity duration-500 motion-reduce:transition-none ${active ? "opacity-100" : "opacity-40"} ${itemClassName}`}
            >
              {onSelect ? (
                <button type="button" onClick={() => onSelect(i)} aria-pressed={active} className="relative block w-full text-left">
                  {body}
                </button>
              ) : (
                body
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function focusOrigin(sequence: PhotoSequence) {
  return `${(sequence.focus?.x ?? 0.5) * 100}% ${(sequence.focus?.y ?? 0.6) * 100}%`;
}
