export default function IllustrationArchitecture() {
  return (
    <svg
      viewBox="0 0 900 480"
      preserveAspectRatio="xMidYMin slice"
      className="absolute inset-x-0 top-0 w-full h-[480px] pointer-events-none select-none"
      style={{
        maskImage: "linear-gradient(to bottom, black 0%, black 45%, transparent 88%)",
        WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 45%, transparent 88%)",
      }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ia-trait" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5B9DFF" />
          <stop offset="100%" stopColor="#2E6BEE" />
        </linearGradient>
      </defs>

      {/* lignes de fond éparses */}
      <g stroke="#2E6BEE" strokeOpacity="0.08" strokeWidth="1">
        <line x1="0" y1="60" x2="900" y2="60" />
        <line x1="0" y1="140" x2="900" y2="140" />
        <line x1="0" y1="380" x2="900" y2="380" />
        <line x1="120" y1="0" x2="120" y2="480" />
        <line x1="760" y1="0" x2="760" y2="480" />
      </g>

      {/* lignes de connexion façon schéma technique */}
      <g stroke="#5B9DFF" strokeOpacity="0.35" strokeWidth="1">
        <line x1="290" y1="230" x2="80" y2="120" />
        <line x1="450" y1="150" x2="450" y2="40" />
        <line x1="610" y1="230" x2="830" y2="140" />
        <line x1="290" y1="340" x2="70" y2="380" />
      </g>
      <g fill="#5B9DFF" fillOpacity="0.7">
        <circle cx="80" cy="120" r="2.5" />
        <circle cx="450" cy="40" r="2.5" />
        <circle cx="830" cy="140" r="2.5" />
        <circle cx="70" cy="380" r="2.5" />
      </g>

      {/* bâtiment isométrique */}
      <g stroke="url(#ia-trait)" strokeWidth="1.6" fill="none" strokeOpacity="0.8">
        {/* toit */}
        <polygon points="450,150 610,230 450,310 290,230" />
        {/* face gauche */}
        <polygon points="290,230 450,310 450,420 290,340" />
        {/* face droite */}
        <polygon points="450,310 610,230 610,340 450,420" />
        {/* arêtes verticales */}
        <line x1="290" y1="230" x2="290" y2="340" strokeOpacity="0.5" />
        <line x1="610" y1="230" x2="610" y2="340" strokeOpacity="0.5" />
        <line x1="450" y1="310" x2="450" y2="420" strokeOpacity="0.5" />
        {/* nervures du toit */}
        <line x1="450" y1="150" x2="450" y2="310" strokeOpacity="0.3" />
        <line x1="370" y1="190" x2="370" y2="270" strokeOpacity="0.2" />
        <line x1="530" y1="190" x2="530" y2="270" strokeOpacity="0.2" />
      </g>

      {/* petit édicule technique sur le toit */}
      <g stroke="#5B9DFF" strokeOpacity="0.5" strokeWidth="1.2" fill="none">
        <polygon points="400,225 430,242 400,259 370,242" />
        <line x1="400" y1="225" x2="400" y2="259" strokeOpacity="0.25" />
      </g>

      {/* points lumineux d'angle */}
      <g fill="#5B9DFF">
        <circle cx="450" cy="150" r="3" />
        <circle cx="610" cy="230" r="3" />
        <circle cx="290" cy="230" r="3" />
        <circle cx="450" cy="310" r="3" />
      </g>

      {/* cotes décoratives */}
      <g stroke="#5B9DFF" strokeOpacity="0.35" strokeWidth="1">
        <line x1="290" y1="200" x2="450" y2="120" />
        <line x1="450" y1="120" x2="610" y2="200" />
      </g>
      <text x="330" y="108" fill="#5B9DFF" fillOpacity="0.5" fontSize="12" fontFamily="monospace">18,60 m</text>
      <text x="480" y="108" fill="#5B9DFF" fillOpacity="0.5" fontSize="12" fontFamily="monospace">24,60 m</text>
    </svg>
  );
}
