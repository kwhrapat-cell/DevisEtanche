import { Calculator, FileText, HardHat, House, LayoutDashboard, Package, Receipt, Settings, Users, type Icon } from "@/components/icons";

export interface LienNav {
  href: string;
  label: string;
  icone: Icon;
  /** Masqué pour un sous-traitant restreint (voir les policies RLS dans supabase/schema.sql). */
  masqueSousTraitant?: boolean;
}

export const NAV_PRINCIPALE: LienNav[] = [
  { href: "/accueil", label: "Accueil chantier", icone: House },
  { href: "/dashboard", label: "Tableau de bord", icone: LayoutDashboard },
  { href: "/chantiers", label: "Chantiers", icone: HardHat },
  { href: "/devis", label: "Devis", icone: FileText, masqueSousTraitant: true },
  { href: "/factures", label: "Factures", icone: Receipt, masqueSousTraitant: true },
  { href: "/clients", label: "Clients", icone: Users, masqueSousTraitant: true },
];

export const NAV_OUTILS: LienNav[] = [
  { href: "/calculateur", label: "Calculateur", icone: Calculator },
  { href: "/catalogue", label: "Catalogue produits", icone: Package },
];

export const NAV_BAS: LienNav[] = [{ href: "/parametres", label: "Paramètres", icone: Settings, masqueSousTraitant: true }];

export function estActif(pathname: string | null, href: string): boolean {
  return pathname === href || !!pathname?.startsWith(`${href}/`);
}
