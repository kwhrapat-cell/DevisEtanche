import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import type { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";

/** `marque` = orange DevisEtanche, réservé aux pages publiques (accueil, campagnes) ; dans l'appli, `primaire`. */
type Variante = "primaire" | "marque" | "secondaire" | "fantome" | "danger";
type Taille = "sm" | "md" | "lg";

interface OptionsBouton {
  variante?: Variante;
  /** `lg` = 48 px de haut : la taille « chantier », utilisable avec des gants. */
  taille?: Taille;
  pleineLargeur?: boolean;
}

const VARIANTES: Record<Variante, string> = {
  primaire: "bg-primaire text-white shadow-sm hover:bg-primaire/90",
  // Texte marine sur orange : 6,3 pour 1 de contraste (le blanc n'atteint que 2,8).
  marque: "bg-accent text-marine font-semibold shadow-sm hover:bg-accent/90",
  secondaire: "bg-surface text-encre border border-ligne hover:bg-sable",
  fantome: "text-encre/80 hover:bg-sable hover:text-encre",
  danger: "bg-rouge text-white shadow-sm hover:bg-rouge/90",
};

const TAILLES: Record<Taille, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-5 text-base gap-2",
};

const TAILLE_ICONE: Record<Taille, number> = { sm: 16, md: 18, lg: 20 };

/** Classes d'un bouton — utilisable aussi sur un <Link> ou un <a>. */
export function classesBouton({ variante = "primaire", taille = "md", pleineLargeur = false }: OptionsBouton = {}): string {
  return cn(
    "inline-flex items-center justify-center rounded-xl font-medium transition-colors",
    "disabled:pointer-events-none disabled:opacity-50",
    VARIANTES[variante],
    TAILLES[taille],
    pleineLargeur && "w-full"
  );
}

function Contenu({ icone: IconeBouton, taille = "md", children }: { icone?: Icon; taille?: Taille; children?: ReactNode }) {
  return (
    <>
      {IconeBouton && <IconeBouton size={TAILLE_ICONE[taille]} className="shrink-0" />}
      {children}
    </>
  );
}

export function Button({
  variante,
  taille,
  pleineLargeur,
  icone,
  className,
  children,
  type = "button",
  ...props
}: OptionsBouton & ButtonHTMLAttributes<HTMLButtonElement> & { icone?: Icon }) {
  return (
    <button type={type} className={cn(classesBouton({ variante, taille, pleineLargeur }), className)} {...props}>
      <Contenu icone={icone} taille={taille}>
        {children}
      </Contenu>
    </button>
  );
}

export function ButtonLink({
  href,
  variante,
  taille,
  pleineLargeur,
  icone,
  className,
  children,
  ...props
}: OptionsBouton & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; icone?: Icon }) {
  return (
    <Link href={href} className={cn(classesBouton({ variante, taille, pleineLargeur }), className)} {...props}>
      <Contenu icone={icone} taille={taille}>
        {children}
      </Contenu>
    </Link>
  );
}
