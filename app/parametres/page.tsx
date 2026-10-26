import TopBar from "@/components/TopBar";
import { getUtilisateurCourant } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { CircleAlert, CircleCheck } from "@/components/icons";
import { classesBouton } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { COMPANY_INFO } from "@/lib/company-info";
import type { Devise } from "@/lib/devise";
import { PRIX_FORFAITS, paiementEnLigneConfigure } from "@/lib/paiement";
import ForfaitCard from "./ForfaitCard";
import MarcheForm from "./MarcheForm";
import PertesForm from "./PertesForm";
import { reglagesPertesEntreprise } from "@/lib/calc/etancheite";
import CoordonneesForm from "./CoordonneesForm";
import InstallerAppli from "@/components/InstallerAppli";

const labelRole: Record<string, string> = {
  ouvrier: "Ouvrier",
  chef_de_chantier: "Chef de chantier",
  conducteur_de_travaux: "Conducteur de travaux",
  administrateur: "Administrateur",
  client: "Client",
};

/** Messages affichés au retour de Lemon Squeezy (?paiement=…) ou de « Gérer mon abonnement » (?abonnement=…). */
const MESSAGES_RETOUR: Record<string, { texte: string; ok: boolean }> = {
  "paiement:succes": {
    texte: "Paiement reçu, merci ! Votre forfait s'active dans la minute : rechargez la page s'il n'apparaît pas encore.",
    ok: true,
  },
  "abonnement:aucun": { texte: "Aucun abonnement en ligne n'est enregistré pour votre entreprise.", ok: false },
  "abonnement:indisponible": {
    texte: "L'espace abonnement est momentanément indisponible. Réessayez dans quelques minutes ou écrivez-nous.",
    ok: false,
  },
};

export default async function ParametresPage({ searchParams }: { searchParams: Promise<{ paiement?: string; abonnement?: string }> }) {
  const { paiement, abonnement } = await searchParams;
  const retour =
    (typeof paiement === "string" && MESSAGES_RETOUR[`paiement:${paiement}`]) ||
    (typeof abonnement === "string" && MESSAGES_RETOUR[`abonnement:${abonnement}`]) ||
    null;

  const session = await getUtilisateurCourant();
  const supabase = await createClient();

  const entrepriseId = session?.profile?.entreprise_id;
  const { data: entreprise } = entrepriseId ? await supabase.from("entreprises").select("*").eq("id", entrepriseId).single() : { data: null };
  const { data: equipe } = entrepriseId
    ? await supabase.from("profiles").select("id, nom, role").eq("entreprise_id", entrepriseId)
    : { data: [] };

  // Prix dans la devise de l'entreprise (XPF en Calédonie, € en métropole), et paiement
  // en ligne seulement s'il est configuré : sinon, demande par e-mail.
  const devise: Devise = entreprise?.devise === "EUR" ? "EUR" : "XPF";
  const prix = PRIX_FORFAITS[devise];
  const achat = { paiementEnLigne: paiementEnLigneConfigure(), emailContact: COMPANY_INFO.email };

  return (
    <>
        <TopBar titre="Paramètres" sousTitre="Entreprise, équipe et forfait" />
        <div className="p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
          {entrepriseId && entreprise && (
            <>
              <CoordonneesForm
                entrepriseId={entrepriseId}
                nom={entreprise.nom}
                adresse={entreprise.adresse}
                telephone={entreprise.telephone}
                email={entreprise.email}
                numeroIdentification={entreprise.numero_identification}
                formeJuridique={entreprise.forme_juridique ?? null}
                conditionsReglement={entreprise.conditions_reglement ?? null}
                validiteDevisJours={entreprise.validite_devis_jours ?? 30}
              />
              <MarcheForm
                entrepriseId={entrepriseId}
                devise={entreprise.devise}
                libelleTaxe={entreprise.libelle_taxe}
                tauxTaxeDefaut={Number(entreprise.taux_taxe_defaut)}
              />
              <PertesForm entrepriseId={entrepriseId} reglages={reglagesPertesEntreprise(entreprise)} />
            </>
          )}

          <div className="card p-5">
            <div className="font-medium text-encre mb-3">Équipe</div>
            {!equipe || equipe.length === 0 ? (
              <p className="text-sm text-encre/60">Aucun membre.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {equipe.map((m) => (
                  <li key={m.id} className="flex justify-between text-sm">
                    <span className="text-encre">{m.nom}</span>
                    <span className="text-encre/60">{labelRole[m.role] ?? m.role}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="font-medium text-encre mb-3">Forfait</div>
            {retour && (
              <p role="status" className={`mb-3 flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${retour.ok ? "bg-emerald-50 text-emerald-700" : "bg-rouge/10 text-rouge"}`}>
                {retour.ok ? <CircleCheck size={18} className="mt-0.5 shrink-0" /> : <CircleAlert size={18} className="mt-0.5 shrink-0" />}
                {retour.texte}
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <ForfaitCard id="decouverte" nom="Découverte" prix={prix.decouverte} actuel={entreprise?.forfait === "decouverte"} {...achat} />
              <ForfaitCard id="artisan" nom="Artisan" prix={prix.artisan} actuel={entreprise?.forfait === "artisan"} recommande {...achat} />
              <ForfaitCard id="pro" nom="Pro" prix={prix.pro} actuel={entreprise?.forfait === "pro"} {...achat} />
              <ForfaitCard id="entreprise" nom="Entreprise" prix="Sur devis" actuel={entreprise?.forfait === "entreprise"} {...achat} />
            </div>
            <p className="mt-3 text-xs text-encre/60">
              Prix hors taxes, sans engagement.
              {achat.paiementEnLigne
                ? " Paiement par carte ou PayPal, encaissé par notre revendeur Lemon Squeezy, qui vous envoie la facture."
                : " Pour changer de forfait, écrivez-nous : la facture vous est envoyée directement."}
            </p>
            {achat.paiementEnLigne && entreprise?.paiement_abonnement_id && (
              <a href="/api/abonnement" className={`mt-4 ${classesBouton({ variante: "secondaire", taille: "lg" })}`}>
                Gérer mon abonnement
              </a>
            )}
          </div>

          <InstallerAppli />

          <div className="card p-5">
            <div className="font-medium text-encre mb-1">Mode hors ligne</div>
            <p className="text-sm text-encre/60">
              Actif — les pages déjà ouvertes restent consultables, et les zones créées sans réseau sont envoyées au retour du signal. Les photos et
              les changements de statut demandent une connexion.
            </p>
          </div>

          <Card className="p-5 lg:col-span-2">
            <CardHeader titre="Confidentialité et données" />
            <p className="mb-4 text-sm text-encre/70">
              Consultez notre{" "}
              <a href="/confidentialite" className="font-medium text-primaire hover:underline">
                politique de confidentialité
              </a>
              . Pour supprimer votre compte et toutes les données associées (entreprise, chantiers, devis, factures, clients, photos), envoyez une
              demande à {COMPANY_INFO.email} depuis l'adresse e-mail de votre compte. La suppression est faite sous 30 jours.
            </p>
            <a href={`mailto:${COMPANY_INFO.email}?subject=${encodeURIComponent("Suppression de compte")}`} className={classesBouton({ variante: "secondaire" })}>
              <CircleAlert size={18} className="shrink-0 text-rouge" />
              Demander la suppression de mon compte
            </a>
          </Card>
        </div>
    </>
  );
}
