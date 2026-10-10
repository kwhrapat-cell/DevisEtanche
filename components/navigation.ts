import { Calculator, FileText, HardHat, House, Layers, LayoutDashboard, Package, Receipt, Settings, Users, type Icon } from "@/components/icons";

export interface LienNav {
  href: string;
  label: string;
  icone: Icon;
  /** Masqué pour un sous-traitant restreint (voir les policies RLS dans supabase/schema.sql). */
  masqueSousTraitant?: boolean;
  /** Masqué pour un donneur d'ordre (voir les policies RLS dans supabase/migration-donneur-ordre.sql). */
  masqueDonneurOrdre?: boolean;
}

export const NAV_PRINCIPALE: LienNav[] = [
  { href: "/accueil", label: "Accueil chantier", icone: House, masqueDonneurOrdre: true },
  { href: "/dashboard", label: "Tableau de bord", icone: LayoutDashboard, masqueDonneurOrdre: true },
  { href: "/chantiers", label: "Chantiers", icone: HardHat, masqueDonneurOrdre: true },
  { href: "/devis", label: "Devis", icone: FileText, masqueSousTraitant: true, masqueDonneurOrdre: true },
  { href: "/factures", label: "Factures", icone: Receipt, masqueSousTraitant: true, masqueDonneurOrdre: true },
  { href: "/clients", label: "Clients", icone: Users, masqueSousTraitant: true, masqueDonneurOrdre: true },
];

/** Visible uniquement pour un donneur d'ordre : son tableau de bord Portfolio. */
export const NAV_PORTEFEUILLE: LienNav[] = [{ href: "/portefeuille", label: "Portefeuille", icone: Layers }];

export const NAV_OUTILS: LienNav[] = [
  { href: "/calculateur", label: "Calculateur", icone: Calculator, masqueDonneurOrdre: true },
  { href: "/catalogue", label: "Catalogue produits", icone: Package, masqueDonneurOrdre: true },
];

export const NAV_BAS: LienNav[] = [{ href: "/parametres", label: "Paramètres", icone: Settings, masqueSousTraitant: true }];

export function estActif(pathname: string | null, href: string): boolean {
  return pathname === href || !!pathname?.startsWith(`${href}/`);
}
