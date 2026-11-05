/**
 * Illustratieve zijaanzicht-close-up van een donkere, merkloze auto:
 * dakrail, zijruiten, raamomlijsting, spiegel en deurschouder.
 *
 * Alles staat in één SVG en één camera-groep, zodat de trim altijd exact
 * op de carrosserie uitgelijnd blijft, op elk scherm en bij elke uitsnede.
 * Alleen de raamomlijsting wisselt tussen chroom en satijnzwart; lak, glas
 * en carrosserie blijven gelijk.
 *
 * Wordt gebruikt door de hero (scroll-gestuurd), de configurator en de
 * Chrome Delete-sectie. Zachte lichtvlakken zijn gradients, geen filters,
 * zodat transformaties tijdens het scrollen goedkoop blijven.
 */

export const VIEWBOX = { w: 1600, h: 1000 };

// Buitenrand van de carrosserie (bovenzijde), auto rijdt naar links.
const BODY =
  "M -40 662 C 180 636 400 604 556 580 C 640 520 760 404 858 342 C 900 320 980 312 1060 310 L 1252 312 C 1352 318 1442 382 1532 470 C 1572 506 1612 526 1660 538 L 1660 1040 L -40 1040 Z";

// Raamopening (DLO). De trim volgt exact deze lijn.
const DLO =
  "M 642 574 C 702 520 790 432 880 380 C 920 362 982 353 1062 351 L 1240 353 C 1322 357 1392 412 1452 494 C 1464 512 1466 530 1456 541 L 662 588 C 648 589 636 584 642 574 Z";

const B_PILLAR = "M 1090 352 L 1130 352 L 1121 563 L 1081 565 Z";

const MIRROR =
  "M 548 642 C 548 610 576 590 622 586 C 664 583 694 596 700 616 C 705 636 690 654 660 660 C 620 667 570 664 552 656 Z";
const MIRROR_ARM = "M 664 600 C 676 590 690 586 700 590 L 704 612 C 694 610 682 612 672 618 Z";

export type TrimArtworkProps = {
  idPrefix: string;
  /** 0 = origineel chroom, 1 = satijnzwart */
  mix?: number;
  /** SVG-transform voor de camera-groep */
  camera?: string;
  /** 0..1, verschuift studioreflecties */
  reflect?: number;
  /** Indien gezet: links van deze x chroom, rechts satijnzwart (voor/na-uitsnede). */
  split?: number | null;
  preserveAspectRatio?: string;
  className?: string;
  title?: string;
  /** Toon geen transition op de trim (hero stuurt zelf aan). */
  instant?: boolean;
};

export function reflectTransforms(r: number) {
  return {
    body: `translate(${(-260 * r).toFixed(1)} 0)`,
    glass: `translate(${(-420 * r).toFixed(1)} ${(30 * r).toFixed(1)})`,
    chrome: `translate(${(-380 * r).toFixed(1)} ${(-60 * r).toFixed(1)})`,
  };
}

export function TrimArtwork({
  idPrefix: p,
  mix = 0,
  camera = "",
  reflect = 0,
  split = null,
  preserveAspectRatio = "xMidYMid slice",
  className,
  title = "Illustratie: raamomlijsting van een donkere auto",
  instant = false,
}: TrimArtworkProps) {
  const id = (s: string) => `${p}-${s}`;
  const url = (s: string) => `url(#${id(s)})`;
  const rt = reflectTransforms(reflect);
  const satinOpacity = split === null ? mix : 1;

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`}
      preserveAspectRatio={preserveAspectRatio}
      className={className}
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id={id("bg")} cx="0.62" cy="0.48" r="0.62">
          <stop offset="0" stopColor="#202326" />
          <stop offset="0.55" stopColor="#15171a" />
          <stop offset="1" stopColor="#101112" />
        </radialGradient>

        {/* Lange zachte studiolamp */}
        <radialGradient id={id("lamp")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f6f4ef" stopOpacity="1" />
          <stop offset="0.45" stopColor="#f2f0ec" stopOpacity="0.85" />
          <stop offset="0.8" stopColor="#f2f0ec" stopOpacity="0.12" />
          <stop offset="1" stopColor="#f2f0ec" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id("lampGlow")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f2f0ec" stopOpacity="0.16" />
          <stop offset="1" stopColor="#f2f0ec" stopOpacity="0" />
        </radialGradient>

        {/* Lak: donker grafiet met genoeg detail in de schaduw */}
        <linearGradient id={id("paint")} x1="0" y1="300" x2="0" y2="1000" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3a3e43" />
          <stop offset="0.07" stopColor="#24272b" />
          <stop offset="0.42" stopColor="#1e2125" />
          <stop offset="0.5" stopColor="#2b2f34" />
          <stop offset="0.56" stopColor="#1a1c1f" />
          <stop offset="1" stopColor="#0f1012" />
        </linearGradient>
        <radialGradient id={id("soft")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#e9ebec" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#e9ebec" stopOpacity="0.16" />
          <stop offset="1" stopColor="#e9ebec" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id("softStrong")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f4f3ef" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#e9ebec" stopOpacity="0.4" />
          <stop offset="1" stopColor="#e9ebec" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("rim")} x1="0" y1="0" x2="1600" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f2f0ec" stopOpacity="0.05" />
          <stop offset="0.45" stopColor="#f2f0ec" stopOpacity="0.55" />
          <stop offset="0.8" stopColor="#f2f0ec" stopOpacity="0.4" />
          <stop offset="1" stopColor="#f2f0ec" stopOpacity="0.08" />
        </linearGradient>

        {/* Glas */}
        <linearGradient id={id("glass")} x1="0" y1="350" x2="0" y2="590" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#262b31" />
          <stop offset="0.5" stopColor="#14171b" />
          <stop offset="1" stopColor="#0a0b0d" />
        </linearGradient>
        <linearGradient id={id("glassBand")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#dfe3e6" stopOpacity="0" />
          <stop offset="0.5" stopColor="#dfe3e6" stopOpacity="0.2" />
          <stop offset="1" stopColor="#dfe3e6" stopOpacity="0" />
        </linearGradient>

        {/* Chroom: harde wisseling tussen licht en donker, schuift mee met de reflectie */}
        <linearGradient
          id={id("chrome")}
          data-chrome-grad=""
          x1="560"
          y1="300"
          x2="1520"
          y2="640"
          gradientUnits="userSpaceOnUse"
          gradientTransform={rt.chrome}
          spreadMethod="reflect"
        >
          <stop offset="0" stopColor="#5d6268" />
          <stop offset="0.1" stopColor="#f5f6f7" />
          <stop offset="0.17" stopColor="#a3a9ae" />
          <stop offset="0.28" stopColor="#3a3f44" />
          <stop offset="0.4" stopColor="#dfe2e5" />
          <stop offset="0.47" stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#80868c" />
          <stop offset="0.68" stopColor="#2b2f33" />
          <stop offset="0.8" stopColor="#d3d7da" />
          <stop offset="0.9" stopColor="#f4f5f6" />
          <stop offset="1" stopColor="#7c8288" />
        </linearGradient>

        {/* Satijnzwart: laag contrast, zachte glans */}
        <linearGradient id={id("satin")} x1="560" y1="300" x2="1520" y2="640" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1d1f22" />
          <stop offset="0.35" stopColor="#2c2f33" />
          <stop offset="0.6" stopColor="#1b1d20" />
          <stop offset="1" stopColor="#25282b" />
        </linearGradient>

        <linearGradient id={id("pillar")} x1="0" y1="350" x2="0" y2="566" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1b1e21" />
          <stop offset="0.3" stopColor="#08090a" />
          <stop offset="1" stopColor="#060607" />
        </linearGradient>

        <clipPath id={id("bodyClip")}>
          <path d={BODY} />
        </clipPath>
        <clipPath id={id("dloClip")}>
          <path d={DLO} />
        </clipPath>
        {split !== null && (
          <clipPath id={id("splitClip")}>
            <rect x={split} y="0" width={VIEWBOX.w * 2} height={VIEWBOX.h} />
          </clipPath>
        )}
      </defs>

      <title>{title}</title>

      <rect x="-400" y="-400" width={VIEWBOX.w + 800} height={VIEWBOX.h + 800} fill={url("bg")} />

      <g data-cam="" transform={camera}>
        {/* Studiolamp */}
        <rect x="80" y="10" width="1560" height="220" fill={url("lampGlow")} />
        <rect x="210" y="74" width="1300" height="40" fill={url("lamp")} />

        {/* Carrosserie */}
        <path d={BODY} fill={url("paint")} />
        <g clipPath={url("bodyClip")}>
          <g data-refl="" transform={rt.body}>
            {/* reflectie van de lamp op dakrail */}
            <rect x="760" y="296" width="760" height="54" fill={url("softStrong")} />
            {/* zachte lichtstrook langs de schouder */}
            <rect x="260" y="592" width="1500" height="84" fill={url("soft")} />
            {/* motorkap */}
            <rect x="-120" y="600" width="820" height="70" fill={url("softStrong")} opacity="0.7" />
            {/* onderste deurvlak, heel zacht */}
            <rect x="500" y="760" width="1300" height="220" fill={url("soft")} opacity="0.35" />
          </g>
          {/* karakterlijn */}
          <path d="M 560 652 C 900 636 1300 622 1660 606" fill="none" stroke="#f2f0ec" strokeOpacity="0.16" strokeWidth="2" />
          <path d="M 560 655 C 900 639 1300 625 1660 609" fill="none" stroke="#000" strokeOpacity="0.5" strokeWidth="2" />
          {/* deurnaden */}
          <path d="M 1103 566 C 1108 700 1106 860 1100 1040" fill="none" stroke="#050506" strokeWidth="3" />
          <path d="M 1106 566 C 1111 700 1109 860 1103 1040" fill="none" stroke="#f2f0ec" strokeOpacity="0.07" strokeWidth="1.5" />
          <path d="M 606 596 C 596 700 594 860 600 1040" fill="none" stroke="#050506" strokeWidth="3" />
          {/* portiergrepen in carrosseriekleur */}
          <rect x="930" y="700" width="120" height="16" rx="8" fill="#141618" />
          <rect x="932" y="700" width="116" height="3" rx="1.5" fill="#f2f0ec" opacity="0.12" />
          <rect x="1330" y="686" width="112" height="16" rx="8" fill="#141618" />
          <rect x="1332" y="686" width="108" height="3" rx="1.5" fill="#f2f0ec" opacity="0.12" />
        </g>
        {/* lichtrand langs de daklijn voor scheiding met de achtergrond */}
        <path
          d="M -40 662 C 180 636 400 604 556 580 C 640 520 760 404 858 342 C 900 320 980 312 1060 310 L 1252 312 C 1352 318 1442 382 1532 470 C 1572 506 1612 526 1660 538"
          fill="none"
          stroke={url("rim")}
          strokeWidth="2"
        />

        {/* Glas */}
        <path d={DLO} fill={url("glass")} />
        <g clipPath={url("dloClip")}>
          {/* hoofdsteun, nauwelijks zichtbaar */}
          <path d="M 930 470 C 930 430 1000 418 1030 440 C 1046 452 1044 500 1030 520 L 940 524 C 930 510 928 490 930 470 Z" fill="#2a2f35" opacity="0.4" />
          <g data-glass-refl="" transform={rt.glass}>
            <rect x="760" y="300" width="300" height="320" fill={url("glassBand")} transform="rotate(-22 910 460)" />
            <rect x="1180" y="300" width="160" height="320" fill={url("glassBand")} opacity="0.6" transform="rotate(-22 1260 460)" />
          </g>
        </g>
        <path d={B_PILLAR} fill={url("pillar")} />
        <path d="M 1092 354 L 1100 354 L 1092 562 L 1084 562 Z" fill="#f2f0ec" opacity="0.07" />

        {/* Raamomlijsting */}
        <path d={DLO} fill="none" stroke="#040405" strokeWidth="27" strokeLinejoin="round" />
        <g data-chrome="">
          <path d={DLO} fill="none" stroke={url("chrome")} strokeWidth="18" strokeLinejoin="round" />
          <path d={DLO} fill="none" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="2.5" strokeLinejoin="round" />
        </g>
        <g
          data-satin=""
          opacity={satinOpacity}
          clipPath={split !== null ? url("splitClip") : undefined}
          style={instant ? undefined : { transition: "opacity 520ms cubic-bezier(0.2,0.7,0.2,1)" }}
          className="motion-reduce:!transition-none"
        >
          <path d={DLO} fill="none" stroke="#141517" strokeWidth="19" strokeLinejoin="round" />
          <path d={DLO} fill="none" stroke={url("satin")} strokeWidth="18" strokeLinejoin="round" />
          <path d={DLO} fill="none" stroke="#f2f0ec" strokeOpacity="0.09" strokeWidth="2" strokeLinejoin="round" />
        </g>
        {split !== null && (
          <line x1={split} y1="330" x2={split} y2="610" stroke="#c7cbce" strokeOpacity="0.8" strokeWidth="2" strokeDasharray="2 6" />
        )}

        {/* Spiegel */}
        <path d={MIRROR_ARM} fill="#121416" />
        <path d={MIRROR} fill={url("paint")} />
        <path d="M 560 618 C 580 598 630 592 680 600" fill="none" stroke="#f2f0ec" strokeOpacity="0.3" strokeWidth="3" strokeLinecap="round" />
        <path d={MIRROR} fill="none" stroke="#000" strokeOpacity="0.5" strokeWidth="1.5" />
      </g>
    </svg>
  );
}
