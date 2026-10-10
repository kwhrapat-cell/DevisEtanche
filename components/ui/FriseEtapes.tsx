import { CircleCheck } from "@/components/icons";
import { ETAPES_CHANTIER, indexEtape } from "@/lib/statuts";
import { cn } from "@/lib/utils";

/**
 * Frise des étapes du chantier (Préparation → … → Réception).
 * Verticale avec descriptions sur téléphone, horizontale à partir de sm.
 * `termine` : toutes les étapes sont faites (chantier au statut « Terminé »).
 */
export function FriseEtapes({ etape, termine = false, className }: { etape: string | null | undefined; termine?: boolean; className?: string }) {
  const actuelle = termine ? ETAPES_CHANTIER.length : indexEtape(etape);
  const derniere = ETAPES_CHANTIER.length - 1;

  return (
    <div className={className}>
      <ol className="flex flex-col sm:flex-row">
        {ETAPES_CHANTIER.map(({ cle, label, description }, i) => {
          const faite = i < actuelle;
          const enCours = i === actuelle;
          return (
            <li key={cle} className="relative flex gap-3 pb-6 last:pb-0 sm:flex-1 sm:flex-col sm:items-center sm:gap-2 sm:pb-0 sm:text-center">
              {/* Trait vers l'étape suivante : vertical sur téléphone, horizontal au-delà. */}
              {i < derniere && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute bottom-0 left-[15px] top-9 w-0.5 rounded-full",
                    "sm:bottom-auto sm:left-[calc(50%+22px)] sm:right-[calc(-50%+22px)] sm:top-[15px] sm:h-0.5 sm:w-auto",
                    faite ? "bg-vert" : "bg-ligne"
                  )}
                />
              )}
              <span
                className={cn(
                  "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                  faite && "bg-vert text-white",
                  enCours && "bg-primaire text-white ring-4 ring-primaire/20",
                  !faite && !enCours && "bg-sable text-encre/60"
                )}
              >
                {faite ? <CircleCheck size={18} /> : i + 1}
              </span>
              <div className="min-w-0 pt-1 sm:pt-0">
                <div className={cn("text-sm", enCours ? "font-semibold text-encre" : faite ? "font-medium text-encre/80" : "text-encre/60")}>
                  {label}
                  {enCours && <span className="sr-only"> (étape en cours)</span>}
                </div>
                <p className={cn("mt-0.5 text-xs text-encre/60 sm:hidden", enCours && "text-encre/80")}>{description}</p>
              </div>
            </li>
          );
        })}
      </ol>
      {/* Sur ordinateur, la description de l'étape en cours sous la frise. */}
      {actuelle <= derniere && (
        <p className="mt-4 hidden rounded-xl bg-primaire/5 px-4 py-3 text-sm text-encre/80 sm:block">
          <span className="font-semibold text-encre">{ETAPES_CHANTIER[actuelle].label} : </span>
          {ETAPES_CHANTIER[actuelle].description}
        </p>
      )}
    </div>
  );
}
