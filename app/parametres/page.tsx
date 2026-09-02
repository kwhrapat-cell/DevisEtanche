import TopBar from "@/components/TopBar";
import { getUtilisateurCourant } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { COMPANY_INFO } from "@/lib/company-info";
import ForfaitCard from "./ForfaitCard";
import MarcheForm from "./MarcheForm";
import CoordonneesForm from "./CoordonneesForm";

const labelRole: Record<string, string> = {
  ouvrier: "Ouvrier",
  chef_de_chantier: "Chef de chantier",
  conducteur_de_travaux: "Conducteur de travaux",
  administrateur: "Administrateur",
  client: "Client",
};

export default async function ParametresPage() {
  const session = await getUtilisateurCourant();
  const supabase = await createClient();

  const entrepriseId = session?.profile?.entreprise_id;
  const { data: entreprise } = entrepriseId ? await supabase.from("entreprises").select("*").eq("id", entrepriseId).single() : { data: null };
  const { data: equipe } = entrepriseId
    ? await supabase.from("profiles").select("id, nom, role").eq("entreprise_id", entrepriseId)
    : { data: [] };

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
                formeJuridique={entreprise.forme_juridique}
                conditionsReglement={entreprise.conditions_reglement}
                validiteDevisJours={entreprise.validite_devis_jours ?? 30}
              />
              <MarcheForm
                entrepriseId={entrepriseId}
                devise={entreprise.devise}
                libelleTaxe={entreprise.libelle_taxe}
                tauxTaxeDefaut={Number(entreprise.taux_taxe_defaut)}
              />
            </>
          )}

          <div className="card p-5">
            <div className="font-medium text-neige mb-3">Équipe</div>
            {!equipe || equipe.length === 0 ? (
              <p className="text-sm text-neige/50">Aucun membre.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {equipe.map((m) => (
                  <li key={m.id} className="flex justify-between text-sm">
                    <span className="text-neige">{m.nom}</span>
                    <span className="text-neige/50">{labelRole[m.role] ?? m.role}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="font-medium text-neige mb-3">Forfait</div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <ForfaitCard id="decouverte" nom="Découverte" prix="0 €/mois" actuel={entreprise?.forfait === "decouverte"} />
              <ForfaitCard id="artisan" nom="Artisan" prix="29 €/mois" actuel={entreprise?.forfait === "artisan"} recommande />
              <ForfaitCard id="pro" nom="Pro" prix="59 €/mois" actuel={entreprise?.forfait === "pro"} />
              <ForfaitCard id="entreprise" nom="Entreprise" prix="Sur devis" actuel={entreprise?.forfait === "entreprise"} />
            </div>
          </div>

          <div className="card p-5">
            <div className="font-medium text-neige mb-1">Mode hors ligne</div>
            <p className="text-sm text-neige/50">Actif — vos modifications se synchronisent automatiquement au retour du réseau.</p>
          </div>

          <div className="card p-5 lg:col-span-2">
            <div className="font-medium text-neige mb-1">Confidentialité et données</div>
            <p className="text-sm text-neige/50 mb-3">
              Vous pouvez consulter notre{" "}
              <a href="/confidentialite" className="text-rouille">politique de confidentialité</a> à tout moment.
              Pour demander la suppression de votre compte et de l'ensemble des données associées (entreprise,
              chantiers, devis, clients, photos), envoyez une demande à{" "}
              <a href={`mailto:${COMPANY_INFO.email}?subject=Suppression%20de%20compte`} className="text-rouille">
                {COMPANY_INFO.email}
              </a>{" "}
              depuis l'adresse e-mail de votre compte. La suppression est effectuée manuellement sous 30 jours.
            </p>
            <a
              href={`mailto:${COMPANY_INFO.email}?subject=Suppression%20de%20compte`}
              className="inline-block text-sm bg-[#3B1418] text-[#FF8A80] font-medium rounded-lg px-4 py-2"
            >
              Demander la suppression de mon compte
            </a>
          </div>
        </div>
    </>
  );
}
