type Point = [number, number];

/** Génère les lignes internes d'une grille bilinéaire sur un quadrilatère (parallélogramme).
 *  p00/p10/p01 définissent le quad (le 4e coin est déduit) ; cols/rows = nombre de cases. */
function grilleQuad(p00: Point, p10: Point, p01: Point, cols: number, rows: number) {
  const point = (u: number, v: number): Point => [
    p00[0] + u * (p10[0] - p00[0]) + v * (p01[0] - p00[0]),
    p00[1] + u * (p10[1] - p00[1]) + v * (p01[1] - p00[1]),
  ];
  const lignes: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 1; i < cols; i++) {
    const u = i / cols;
    const a = point(u, 0);
    const b = point(u, 1);
    lignes.push({ x1: a[0], y1: a[1], x2: b[0], y2: b[1] });
  }
  for (let j = 1; j < rows; j++) {
    const v = j / rows;
    const a = point(0, v);
    const b = point(1, v);
    lignes.push({ x1: a[0], y1: a[1], x2: b[0], y2: b[1] });
  }
  return lignes;
}

// Bâtiment isométrique, large, pour dépasser la carte de connexion posée devant :
// toit (back/right/left) + deux façades vitrées bien visibles de part et d'autre.
const TOIT: [Point, Point, Point] = [[450, 100], [820, 205], [80, 205]]; // back, right, left
const FRONT: Point = [450, 310]; // = right + left - back
const BAS_GAUCHE: Point = [80, 340]; // pied de la façade gauche
const BAS_DROIT: Point = [820, 340]; // pied de la façade droite
const BAS_FRONT: Point = [450, 440]; // pied de l'arête frontale

const grilleToit = grilleQuad(TOIT[0], TOIT[1], TOIT[2], 9, 4);
const grilleGauche = grilleQuad(TOIT[2], FRONT, BAS_GAUCHE, 5, 3);
const grilleDroite = grilleQuad(FRONT, TOIT[1], BAS_FRONT, 5, 3);

export default function IllustrationArchitecture({ compact = false }: { compact?: boolean }) {
  return (
    <svg
      viewBox="0 0 900 480"
      preserveAspectRatio={compact ? "xMidYMin meet" : "xMidYMin slice"}
      className={
        compact
          ? "absolute inset-x-0 top-0 w-full h-32 md:h-40 pointer-events-none select-none"
          : "absolute inset-x-0 top-0 w-full h-[480px] pointer-events-none select-none"
      }
      style={
        compact
          ? {
              maskImage: "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
            }
          : {
              maskImage: "linear-gradient(to bottom, black 0%, black 45%, transparent 88%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 45%, transparent 88%)",
            }
      }
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ia-trait" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8FC1FF" />
          <stop offset="100%" stopColor="#2E6BEE" />
        </linearGradient>
        <filter id="ia-lueur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" result="flou" />
          <feMerge>
            <feMergeNode in="flou" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* lignes de fond éparses */}
      <g stroke="#2E6BEE" strokeOpacity="0.08" strokeWidth="1">
        <line x1="0" y1="60" x2="900" y2="60" />
        <line x1="0" y1="140" x2="900" y2="140" />
        <line x1="0" y1="400" x2="900" y2="400" />
        <line x1="120" y1="0" x2="120" y2="480" />
        <line x1="780" y1="0" x2="780" y2="480" />
      </g>

      {/* lignes de connexion façon schéma technique */}
      <g stroke="#5B9DFF" strokeOpacity="0.35" strokeWidth="1">
        <line x1={TOIT[2][0]} y1={TOIT[2][1]} x2="20" y2="115" />
        <line x1={TOIT[0][0]} y1={TOIT[0][1]} x2="450" y2="25" />
        <line x1={TOIT[1][0]} y1={TOIT[1][1]} x2="880" y2="115" />
        <line x1={BAS_GAUCHE[0]} y1={BAS_GAUCHE[1]} x2="15" y2="395" />
        <line x1={BAS_DROIT[0]} y1={BAS_DROIT[1]} x2="885" y2="400" />
      </g>
      <g fill="#5B9DFF" fillOpacity="0.7">
        <circle cx="20" cy="115" r="2.5" />
        <circle cx="450" cy="25" r="2.5" />
        <circle cx="880" cy="115" r="2.5" />
        <circle cx="15" cy="395" r="2.5" />
        <circle cx="885" cy="400" r="2.5" />
      </g>

      {/* façades vitrées : grille façon menuiseries */}
      <g stroke="#5B9DFF" strokeOpacity="0.16" strokeWidth="0.75">
        {[...grilleToit, ...grilleGauche, ...grilleDroite].map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />
        ))}
      </g>

      {/* bâtiment isométrique : arêtes principales, en lueur */}
      <g stroke="url(#ia-trait)" strokeWidth="1.8" fill="none" strokeOpacity="0.9" filter="url(#ia-lueur)">
        <polygon points={`${TOIT[0].join(",")} ${TOIT[1].join(",")} ${FRONT.join(",")} ${TOIT[2].join(",")}`} />
        <polygon points={`${TOIT[2].join(",")} ${FRONT.join(",")} ${BAS_FRONT.join(",")} ${BAS_GAUCHE.join(",")}`} />
        <polygon points={`${FRONT.join(",")} ${TOIT[1].join(",")} ${BAS_DROIT.join(",")} ${BAS_FRONT.join(",")}`} />
        <line x1={TOIT[2][0]} y1={TOIT[2][1]} x2={BAS_GAUCHE[0]} y2={BAS_GAUCHE[1]} strokeOpacity="0.6" />
        <line x1={TOIT[1][0]} y1={TOIT[1][1]} x2={BAS_DROIT[0]} y2={BAS_DROIT[1]} strokeOpacity="0.6" />
        <line x1={FRONT[0]} y1={FRONT[1]} x2={BAS_FRONT[0]} y2={BAS_FRONT[1]} strokeOpacity="0.6" />
      </g>

      {/* petit édicule technique sur le toit */}
      <g stroke="#8FC1FF" strokeOpacity="0.55" strokeWidth="1.2" fill="none">
        <polygon points="450,178 490,198 450,218 410,198" />
        <line x1="450" y1="178" x2="450" y2="218" strokeOpacity="0.25" />
      </g>

      {/* points lumineux d'angle */}
      <g fill="#8FC1FF">
        <circle cx={TOIT[0][0]} cy={TOIT[0][1]} r="3" />
        <circle cx={TOIT[1][0]} cy={TOIT[1][1]} r="3" />
        <circle cx={TOIT[2][0]} cy={TOIT[2][1]} r="3" />
        <circle cx={FRONT[0]} cy={FRONT[1]} r="3" />
      </g>

      {/* cotes décoratives */}
      <g stroke="#5B9DFF" strokeOpacity="0.35" strokeWidth="1">
        <line x1={TOIT[2][0]} y1={TOIT[2][1] - 5} x2={TOIT[0][0]} y2={TOIT[0][1]} />
        <line x1={TOIT[0][0]} y1={TOIT[0][1]} x2={TOIT[1][0]} y2={TOIT[1][1] - 5} />
      </g>
      <text x="200" y="88" fill="#8FC1FF" fillOpacity="0.55" fontSize="12" fontFamily="monospace">18,60 m</text>
      <text x="560" y="88" fill="#8FC1FF" fillOpacity="0.55" fontSize="12" fontFamily="monospace">24,60 m</text>
    </svg>
  );
}
