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
