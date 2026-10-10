import { TONS, type Ton } from "@/lib/statuts";
import { cn } from "@/lib/utils";

const borner = (v: number) => Math.min(100, Math.max(0, Math.round(Number.isFinite(v) ? v : 0)));

/** Barre d'avancement. Par défaut : bleue, verte une fois à 100 %. */
export function ProgressBar({
  valeur,
  ton,
  afficherValeur = false,
  className,
}: {
  valeur: number;
  ton?: Ton;
  afficherValeur?: boolean;
  className?: string;
}) {
  const v = borner(valeur);
  const tonEffectif: Ton = ton ?? (v >= 100 ? "succes" : "info");
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="h-2 flex-1 overflow-hidden rounded-full bg-sable"
        role="progressbar"
        aria-valuenow={v}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={cn("h-full rounded-full transition-[width] duration-500", TONS[tonEffectif].barre)} style={{ width: `${v}%` }} />
      </div>
      {afficherValeur && <span className="w-10 text-right text-xs font-medium tabular-nums text-encre/70">{v}%</span>}
    </div>
  );
}

/** Anneau d'avancement avec le pourcentage au centre (accueil, chantier, espace client). */
export function ProgressRing({
  valeur,
  libelle,
  taille = 120,
  epaisseur = 10,
  ton = "succes",
}: {
  valeur: number;
  libelle?: string;
  taille?: number;
  epaisseur?: number;
  ton?: Ton;
}) {
  const v = borner(valeur);
  const rayon = (taille - epaisseur) / 2;
  const circonference = 2 * Math.PI * rayon;
  return (
    <div className="relative shrink-0" style={{ width: taille, height: taille }} role="img" aria-label={`${v} %${libelle ? ` ${libelle}` : ""}`}>
      <svg width={taille} height={taille} viewBox={`0 0 ${taille} ${taille}`} className="-rotate-90">
        <circle cx={taille / 2} cy={taille / 2} r={rayon} fill="none" strokeWidth={epaisseur} className="stroke-sable" />
        <circle
          cx={taille / 2}
          cy={taille / 2}
          r={rayon}
          fill="none"
          stroke={TONS[ton].hex}
          strokeWidth={epaisseur}
          strokeLinecap="round"
          strokeDasharray={circonference}
          strokeDashoffset={circonference * (1 - v / 100)}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums tracking-tight text-encre" style={{ fontSize: taille * 0.22 }}>
          {v}%
        </span>
        {libelle && <span className="text-xs text-encre/60">{libelle}</span>}
      </div>
    </div>
  );
}
