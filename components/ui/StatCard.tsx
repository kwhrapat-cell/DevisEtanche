import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight, type Icon } from "@/components/icons";
import { TONS, type Ton } from "@/lib/statuts";
import { cn } from "@/lib/utils";

/**
 * Carte chiffre-clé : « Chantiers en cours 7 ». Cliquable si `href` est fourni.
 * Sur téléphone (deux cartes côte à côte), l'icône passe au-dessus du texte.
 */
export function StatCard({
  label,
  valeur,
  icone: IconeStat,
  ton = "info",
  indication,
  href,
}: {
  label: string;
  valeur: ReactNode;
  icone: Icon;
  ton?: Ton;
  indication?: ReactNode;
  href?: string;
}) {
  const contenu = (
    <>
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", TONS[ton].icone)}>
        <IconeStat size={22} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm leading-snug text-encre/60">{label}</div>
        <div className="mt-0.5 text-2xl font-bold tabular-nums tracking-tight text-encre">{valeur}</div>
        {indication && <div className="mt-0.5 text-xs text-encre/60">{indication}</div>}
      </div>
      {href && <ChevronRight size={18} className="absolute right-3 top-4 text-encre/30 sm:right-4 sm:top-5" />}
    </>
  );

  const classes = "card relative flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:gap-4 sm:p-5";
  return href ? (
    <Link href={href} className={cn(classes, "transition-colors hover:border-primaire/40")}>
      {contenu}
    </Link>
  ) : (
    <div className={classes}>{contenu}</div>
  );
}
