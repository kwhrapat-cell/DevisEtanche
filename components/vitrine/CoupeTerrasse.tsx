/**
 * Coupe d'une toiture-terrasse (élément porteur béton, isolant, bicouche, gravillons,
 * relevé sur acrotère) dessinée comme un détail technique. Image de la page d'accueil
 * publique : elle montre d'emblée que l'outil parle le langage de l'étancheur.
 * Couleurs : uniquement les tokens Tailwind (fill-*, stroke-*).
 */

const X_GAUCHE = 148; // bord de coupe, côté terrasse
const X_ACROTERE = 332; // nu intérieur de l'acrotère

/** Points d'une ligne en zigzag (symbole de l'isolant). */
function zigzag(): string {
  const points: string[] = [];
  for (let x = X_GAUCHE + 4, i = 0; x <= X_ACROTERE - 4; x += 8, i++) {
    points.push(`${x},${i % 2 === 0 ? 161 : 182}`);
  }
  return points.join(" ");
}

/** Gravillons : petits ronds en quinconce. */
function gravillons() {
  const ronds: { x: number; y: number }[] = [];
  for (let ligne = 0; ligne < 3; ligne++) {
    const y = 130 + ligne * 7;
    for (let x = X_GAUCHE + 5 + (ligne % 2) * 3.5; x < 316; x += 7) ronds.push({ x, y });
  }
  return ronds;
}

/** Repère : trait du libellé vers la couche, terminé par un point. */
function Repere({ y, x2, y2 }: { y: number; x2: number; y2: number }) {
  return (
    <g>
      <line x1={136} y1={y} x2={x2} y2={y2} className="stroke-encre/40" strokeWidth={1} />
      <circle cx={x2} cy={y2} r={2.5} className="fill-marine" />
    </g>
  );
}

function Libelle({ y, children }: { y: number; children: string }) {
  return (
    <text x={130} y={y} textAnchor="end" fontSize={12.5} className="fill-encre/80">
      {children}
    </text>
  );
}

export default function CoupeTerrasse({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 244"
      role="img"
      aria-label="Coupe d'une toiture-terrasse : dalle béton, pare-vapeur, isolant, étanchéité bicouche, gravillons, relevé sur acrotère et couvertine"
      className={className}
    >
      {/* Élément porteur : dalle + acrotère */}
      <path
        d={`M${X_GAUCHE} 192 H${X_ACROTERE} V40 H368 V230 H${X_GAUCHE} Z`}
        className="fill-sable stroke-encre/50"
        strokeWidth={1.25}
      />
      {/* Pare-vapeur */}
      <path d={`M${X_GAUCHE} 189.5 H${X_ACROTERE - 1} V156`} className="stroke-encre" strokeWidth={2} fill="none" />
      {/* Isolant */}
      <rect x={X_GAUCHE} y={156} width={X_ACROTERE - X_GAUCHE - 2} height={31} className="fill-surface stroke-encre/50" strokeWidth={1} />
      <polyline points={zigzag()} className="stroke-encre/30" strokeWidth={1} fill="none" />
      {/* Étanchéité bicouche, en partie courante et en relevé */}
      <path d={`M${X_GAUCHE} 152 H${X_ACROTERE} V60 H${X_ACROTERE - 4} V156 H${X_GAUCHE} Z`} className="fill-accent" />
      <path d={`M${X_GAUCHE} 148 H${X_ACROTERE - 4} V64 H${X_ACROTERE - 8} V152 H${X_GAUCHE} Z`} className="fill-accent/60" />
      {/* Protection lourde : gravillons */}
      {gravillons().map((r, i) => (
        <circle key={i} cx={r.x} cy={r.y} r={2.2} className="fill-encre/35" />
      ))}
      {/* Couvertine en tête d'acrotère, qui recouvre la tête du relevé */}
      <path d="M318 58 V36 H374 V52" className="stroke-marine" strokeWidth={3} fill="none" strokeLinejoin="round" />

      <Libelle y={40}>Couvertine</Libelle>
      <Repere y={36} x2={316} y2={36} />
      <Libelle y={96}>Relevé</Libelle>
      <Repere y={92} x2={322} y2={92} />
      <Libelle y={132}>Gravillons</Libelle>
      <Repere y={128} x2={162} y2={136} />
      <Libelle y={154}>Étanchéité bicouche</Libelle>
      <Repere y={150} x2={162} y2={152} />
      <Libelle y={176}>Isolant</Libelle>
      <Repere y={172} x2={162} y2={171} />
      <Libelle y={198}>Pare-vapeur</Libelle>
      <Repere y={194} x2={162} y2={189.5} />
      <Libelle y={222}>Dalle béton</Libelle>
      <Repere y={218} x2={162} y2={212} />
    </svg>
  );
}
