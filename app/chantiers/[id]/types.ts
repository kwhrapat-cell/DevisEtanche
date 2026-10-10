/** Données de la fiche chantier, chargées une fois par page.tsx puis passées aux onglets. */
export interface Zone {
  id: string;
  nom: string;
  surface_m2: number | null;
  statut: string;
  avancement_pct: number | null;
  created_at: string;
}

export interface Photo {
  id: string;
  url: string;
  legende: string | null;
  created_at: string;
}

export interface DocumentChantier {
  id: string;
  numero: string;
  statut: string;
  total_ttc: number | null;
  created_at: string;
}

export const ONGLETS = ["apercu", "plan", "photos", "docs", "activite"] as const;
export type CleOnglet = (typeof ONGLETS)[number];

export function lienOnglet(chantierId: string, onglet: CleOnglet): string {
  return onglet === "apercu" ? `/chantiers/${chantierId}` : `/chantiers/${chantierId}?onglet=${onglet}`;
}

export function formatDate(iso: string | null | undefined): string {
  return iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "—";
}
