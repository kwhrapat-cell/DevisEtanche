// Informations légales de l'éditeur — lues par les pages légales (mentions
// légales, CGV, confidentialité), le PDF de devis/facture et les e-mails
// transactionnels. Un seul endroit à modifier une fois l'immatriculation
// finalisée ou les coordonnées mises à jour.
export const COMPANY_INFO = {
  raisonSociale: "Tramea Solutions",
  formeJuridique: "Entreprise individuelle",
  // TODO: remplacer par le numéro définitif une fois l'immatriculation RIDET finalisée
  // (démarche en cours sur guichet-entreprises.nc).
  ridet: "en cours d'attribution",
  adresse: "Lot 73, Groupe d'habitation Julisa, 98889 Païta, Nouvelle-Calédonie (BP 622, 98889 Païta)",
  // Adresses en service aujourd'hui. À remplacer le jour où un domaine propre
  // (devisetanche.nc ou .fr) est acheté et relié à l'appli.
  email: "tramea.solutions@gmail.com",
  siteUrl: "https://devis-etanche.vercel.app",
  hebergeurApplication: "Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
  hebergeurDonnees: "Supabase Inc. (base de données, authentification, stockage de fichiers)",
  directeurPublication: "Tramea Solutions",
} as const;
