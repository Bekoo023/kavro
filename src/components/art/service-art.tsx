/**
 * Illustratieve detailbeelden voor de diensten. Worden vervangen zodra er in
 * src/config/media.ts een eigen foto per dienst staat.
 */

export function PpfArtwork({ className }: { className?: string }) {
  const p = "ppf";
  return (
    <svg
      viewBox="0 0 2100 900"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-label="Illustratie: rand van transparante beschermfolie op donkere lak"
    >
      <defs>
        <linearGradient id={`${p}-paint`} x1="0" y1="0" x2="0" y2="900" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2c3034" />
          <stop offset="0.45" stopColor="#1b1e21" />
          <stop offset="1" stopColor="#0e0f11" />
        </linearGradient>
        <radialGradient id={`${p}-band`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f4f3ef" stopOpacity="0.9" />
          <stop offset="0.35" stopColor="#e9ebec" stopOpacity="0.38" />
          <stop offset="1" stopColor="#e9ebec" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${p}-band2`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="0.3" stopColor="#f2f0ec" stopOpacity="0.5" />
          <stop offset="1" stopColor="#e9ebec" stopOpacity="0" />
        </radialGradient>
        {/* Gefolieerd deel: rechts van de folierand */}
        <clipPath id={`${p}-film`}>
          <path d="M 1010 -20 C 1040 260 1100 560 1180 920 L 2200 920 L 2200 -20 Z" />
        </clipPath>
      </defs>

      <rect width="2100" height="900" fill="#101112" />
      {/* gebogen carrosserievlak (bumperhoek) */}
      <path d="M -20 170 C 600 120 1400 110 2120 170 L 2120 920 L -20 920 Z" fill={`url(#${p}-paint)`} />
      <path d="M -20 170 C 600 120 1400 110 2120 170" fill="none" stroke="#f2f0ec" strokeOpacity="0.35" strokeWidth="2" />
      {/* naad tussen motorkap en bumper */}
      <path d="M -20 300 C 700 262 1400 258 2120 296" fill="none" stroke="#050506" strokeWidth="4" />
      <path d="M -20 304 C 700 266 1400 262 2120 300" fill="none" stroke="#f2f0ec" strokeOpacity="0.08" strokeWidth="2" />

      {/* lamp-reflectie op de originele lak */}
      <ellipse cx="900" cy="470" rx="1150" ry="70" fill={`url(#${p}-band)`} transform="rotate(-4 900 470)" />
      {/* zelfde reflectie op de folie: iets helderder en een paar pixels verschoven */}
      <g clipPath={`url(#${p}-film)`}>
        <rect x="-20" y="130" width="2200" height="800" fill="#ffffff" opacity="0.025" />
        <ellipse cx="906" cy="463" rx="1150" ry="62" fill={`url(#${p}-band2)`} transform="rotate(-4 906 463)" />
      </g>
      {/* de folierand zelf */}
      <path d="M 1010 140 C 1040 330 1100 600 1180 920" fill="none" stroke="#000" strokeOpacity="0.55" strokeWidth="5" />
      <path d="M 1013 140 C 1043 330 1103 600 1183 920" fill="none" stroke="#f6f4ef" strokeOpacity="0.55" strokeWidth="1.6" />
      {/* markering */}
      <circle cx="1056" cy="455" r="30" fill="none" stroke="#c7cbce" strokeWidth="2" />
    </svg>
  );
}

export function TintArtwork({ className }: { className?: string }) {
  const p = "tint";
  const glass =
    "M 180 760 C 230 560 340 360 520 250 C 600 205 700 190 820 188 L 1420 194 C 1470 196 1500 230 1500 280 L 1490 760 Z";
  return (
    <svg
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-label="Illustratie: zijruit met een tint die van licht naar donker verloopt"
    >
      <defs>
        <linearGradient id={`${p}-body`} x1="0" y1="0" x2="0" y2="1000" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2a2d31" />
          <stop offset="1" stopColor="#0f1012" />
        </linearGradient>
        <linearGradient id={`${p}-interior`} x1="0" y1="190" x2="0" y2="760" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6d737a" />
          <stop offset="1" stopColor="#3a3e43" />
        </linearGradient>
        {/* tint van helder (links) naar donker (rechts) */}
        <linearGradient id={`${p}-tint`} x1="180" y1="0" x2="1500" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0b0c0e" stopOpacity="0" />
          <stop offset="0.3" stopColor="#0b0c0e" stopOpacity="0.25" />
          <stop offset="0.62" stopColor="#0b0c0e" stopOpacity="0.72" />
          <stop offset="1" stopColor="#0b0c0e" stopOpacity="0.94" />
        </linearGradient>
        <linearGradient id={`${p}-sheen`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e9ebec" stopOpacity="0" />
          <stop offset="0.5" stopColor="#e9ebec" stopOpacity="0.16" />
          <stop offset="1" stopColor="#e9ebec" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${p}-glass`}>
          <path d={glass} />
        </clipPath>
      </defs>
      <rect width="1600" height="1000" fill="#101112" />
      <path d="M 60 1000 L 60 760 C 120 520 260 260 480 150 C 580 110 700 100 820 98 L 1440 104 C 1530 106 1590 170 1590 260 L 1590 1000 Z" fill={`url(#${p}-body)`} />
      <path d={glass} fill={`url(#${p}-interior)`} />
      <g clipPath={`url(#${p}-glass)`}>
        {/* interieur: hoofdsteun, stoelrug, B-stijl binnenzijde */}
        <path d="M 700 470 C 700 400 800 380 850 410 C 880 430 880 500 860 530 L 715 536 C 702 516 700 494 700 470 Z" fill="#8a9097" />
        <path d="M 640 760 C 650 620 690 560 760 548 L 900 546 C 960 552 990 620 1000 760 Z" fill="#5b6167" />
        <rect x="1180" y="180" width="70" height="600" fill="#1c1f22" />
        <rect x="160" y="180" width="1360" height="600" fill={`url(#${p}-tint)`} />
        <rect x="380" y="140" width="260" height="700" fill={`url(#${p}-sheen)`} transform="rotate(-20 510 490)" />
      </g>
      <path d={glass} fill="none" stroke="#1d1f22" strokeWidth="16" strokeLinejoin="round" />
      <path d={glass} fill="none" stroke="#f2f0ec" strokeOpacity="0.1" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
