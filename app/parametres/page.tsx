import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { getUtilisateurCourant } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import ForfaitCard from "./ForfaitCard";

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
    <div className="flex">
      <Sidebar />
      <main className="flex-1">
        <TopBar titre="Paramètres" sousTitre="Entreprise, équipe et forfait" />
        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
          <div className="card p-5">
            <div className="font-medium text-neige mb-1">Entreprise</div>
            <p className="text-sm text-neige/50">{entreprise?.nom ?? "—"}</p>
          </div>

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
        </div>
      </main>
    </div>
  );
}
