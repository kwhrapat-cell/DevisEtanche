import Link from "next/link";
import type { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";

export interface Onglet {
  cle: string;
  label: string;
  href: string;
  icone?: Icon;
  /** Libellé affiché sur téléphone quand le libellé complet est trop long (« Aperçu »). */
  labelCourt?: string;
  /** Petit compteur à droite du libellé (nombre de photos, de documents…). */
  compteur?: number;
}

/**
 * Barre d'onglets. Chaque onglet est un lien (ex. `?onglet=photos`) : le bouton
 * retour du téléphone fonctionne et un onglet peut être partagé. Sur téléphone,
 * les onglets se partagent la largeur (icône au-dessus du libellé) pour rester
 * tous visibles ; à partir de sm, ils s'alignent en ligne.
 */
export function Tabs({ onglets, actif, className }: { onglets: Onglet[]; actif: string; className?: string }) {
  return (
    <nav className={cn("border-b border-ligne", className)} aria-label="Onglets">
      <ul className="flex sm:gap-1">
        {onglets.map(({ cle, label, labelCourt, href, icone: IconeOnglet, compteur }) => {
          const estActif = cle === actif;
          return (
            <li key={cle} className="min-w-0 flex-1 sm:flex-none">
              <Link
                href={href}
                scroll={false}
                aria-current={estActif ? "page" : undefined}
                className={cn(
                  "-mb-px flex h-14 flex-col items-center justify-center gap-0.5 whitespace-nowrap border-b-2 px-1 text-xs font-medium transition-colors",
                  "sm:h-12 sm:flex-row sm:gap-2 sm:px-3 sm:text-sm",
                  estActif ? "border-primaire text-primaire" : "border-transparent text-encre/60 hover:text-encre"
                )}
              >
                {IconeOnglet && <IconeOnglet size={20} className="shrink-0" />}
                <span className="flex max-w-full items-center gap-1.5">
                  <span className="truncate">
                    {labelCourt ? (
                      <>
                        <span className="sm:hidden">{labelCourt}</span>
                        <span className="hidden sm:inline">{label}</span>
                      </>
                    ) : (
                      label
                    )}
                  </span>
                  {compteur !== undefined && compteur > 0 && (
                    <span className={cn("hidden rounded-full px-1.5 text-xs tabular-nums sm:inline", estActif ? "bg-primaire/10" : "bg-sable")}>
                      {compteur}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
