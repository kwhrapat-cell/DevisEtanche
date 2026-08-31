export type StatutChantier = "en_preparation" | "en_cours" | "termine" | "en_attente";

export interface Client {
  id: string;
  nom: string;
  type: "syndic" | "particulier" | "entreprise";
  ville: string;
  email?: string;
  telephone?: string;
  created_at: string;
}

export interface Zone {
  id: string;
  chantier_id: string;
  nom: string;
  surface_m2: number;
  statut: "termine" | "en_cours" | "en_attente" | "probleme";
  avancement_pct: number;
}

export interface Chantier {
  id: string;
  nom: string;
  ville: string;
  client_id: string;
  statut: StatutChantier;
  surface_totale_m2: number;
  avancement_pct: number;
  systeme: "bicouche" | "pvc" | "resine";
  date_debut: string;
  date_fin_prevue?: string;
  zones?: Zone[];
  /** Non nul pour un chantier créé par un donneur d'ordre — la propriété passe à entreprise_id une fois une entreprise rattachée. */
  donneur_ordre_id?: string | null;
}

export interface LigneDevis {
  designation: string;
  quantite: number;
  unite: string;
  prix_unitaire: number;
  /** Référence vers produits_etancheite.id — traçabilité uniquement, le prix reste figé sur la ligne. */
  produit_id?: string;
  /**
   * Calcul interne (temps × taux horaire) utilisé pour proposer prix_unitaire — jamais
   * affiché sur le devis exporté ni sur la facture : ces vues ne lisent que designation/
   * quantite/unite/prix_unitaire, jamais ces deux champs.
   */
  temps_estime_heures?: number;
  taux_horaire_interne?: number;
}

export interface Devis {
  id: string;
  numero: string;
  chantier_id: string;
  client_id: string;
  statut: "brouillon" | "envoye" | "accepte" | "refuse";
  lignes: LigneDevis[];
  total_ht: number;
  tva_pct: number;
  total_ttc: number;
  created_at: string;
}

export interface Facture {
  id: string;
  numero: string;
  devis_id: string;
  chantier_id: string;
  client_id: string;
  statut: "a_payer" | "payee" | "annulee";
  lignes: LigneDevis[];
  total_ht: number;
  tva_pct: number;
  total_ttc: number;
  date_echeance: string | null;
  created_at: string;
}

export interface Entreprise {
  id: string;
  nom: string;
  devise: "XPF" | "EUR";
  libelle_taxe: string;
  taux_taxe_defaut: number;
  adresse?: string | null;
  telephone?: string | null;
  email?: string | null;
  numero_identification?: string | null;
}

export interface ProduitEtancheite {
  id: string;
  reference: string;
  fabricant: "Soprema" | "Sika" | "Axter";
  gamme: "bitumineux" | "synthetique" | "liquide" | "accessoire";
  nom: string;
  usage_type: "premiere_couche" | "finition" | "anti_racine" | "renfort" | "primaire" | "resine_liquide";
  pose: "soudure_chalumeau" | "soudure_air_chaud" | "auto_adhesif" | "froid_sans_flamme" | "collage_froid" | "fixation_mecanique";
  conditionnement: string | null;
  surface_couverte_m2: number | null;
  poids_kg: number | null;
  consommation_min: number | null;
  consommation_max: number | null;
  unite_consommation: string | null;
  prix_indicatif_min_eur: number | null;
  prix_indicatif_max_eur: number | null;
  prix_indicatif_conditionnement: string | null;
  usage_recommande: string | null;
}

export interface Profile {
  id: string;
  nom: string;
  role: "ouvrier" | "chef_de_chantier" | "conducteur_de_travaux" | "administrateur" | "client" | "donneur_ordre";
  entreprise_id: string;
  /** Non nul pour un sous-traitant ayant rejoint via un code d'invitation : restreint son accès à ce chantier. */
  chantier_assigne_id?: string | null;
}

export type RoleSousTraitance = "ouvrier" | "chef_de_chantier" | "conducteur_de_travaux";

export type TypeEmetteurInvitation = "entreprise" | "donneur_ordre";

export interface InvitationSoustraitance {
  id: string;
  code: string;
  chantier_id: string;
  entreprise_id: string;
  /** Nul lorsque type_emetteur = "donneur_ordre" : le code rattache une entreprise entière, pas un rôle individuel. */
  role_autorise: RoleSousTraitance | null;
  type_emetteur: TypeEmetteurInvitation;
  date_expiration: string;
  utilise: boolean;
  revoquee: boolean;
  created_at: string;
}
