import TopBar from "@/components/TopBar";
import { getUtilisateurCourant } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
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

          {/* Phase de test : la grille tarifaire (ForfaitCard + /api/checkout) est volontairement
              masquée tant que le service n'est pas commercialisé — voir /mentions-legales. */}
          <div className="lg:col-span-2">
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-neige">Forfait</span>
                <span className="badge bg-[#123024] text-vert">gratuit</span>
              </div>
              <p className="text-sm text-neige/50">
                L'application est en phase de test : toutes les fonctionnalités sont accessibles gratuitement,
                sans engagement ni moyen de paiement à renseigner. Les conditions d'abonnement vous seront
                présentées avant toute mise en service payante.
              </p>
            </div>
          </div>

          <div className="card p-5">
            <div className="font-medium text-neige mb-1">Mode hors ligne</div>
            <p className="text-sm text-neige/50">Actif — vos modifications se synchronisent automatiquement au retour du réseau.</p>
          </div>
        </div>
    </>
  );
}
