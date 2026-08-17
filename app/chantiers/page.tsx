import Link from "next/link";
import TopBar from "@/components/TopBar";
import { getUtilisateurCourant } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

const labelStatut: Record<string, string> = {
  en_preparation: "en préparation",
  en_cours: "en cours",
  termine: "terminé",
  en_attente: "en attente",
};

export default async function ChantiersPage() {
  const session = await getUtilisateurCourant();
  const supabase = await createClient();

  const { data: chantiers } = session?.profile
    ? await supabase
        .from("chantiers")
        .select("id, nom, ville, statut, surface_totale_m2, avancement_pct")
        .eq("entreprise_id", session.profile.entreprise_id)
        .order("created_at", { ascending: false })
    : { data: null };

  return (
    <>
        <TopBar titre="Chantiers" sousTitre={`${chantiers?.length ?? 0} chantiers`} />
        <div className="p-8">
          <div className="mb-5">
            <Link href="/chantiers/nouveau" className="inline-flex items-center gap-2 bg-rouille text-white text-sm font-semibold px-4 py-2 rounded-lg">
              + Nouveau chantier
            </Link>
          </div>
          {!chantiers || chantiers.length === 0 ? (
            <div className="card p-10 text-center">
              <div className="font-display font-semibold text-neige mb-2">Aucun chantier pour l'instant</div>
              <p className="text-sm text-neige/50 mb-5 max-w-sm mx-auto">
                Créez votre premier chantier depuis Supabase (table <code>chantiers</code>) ou exécutez{" "}
                <code>supabase/seed.sql</code> pour charger des données de démonstration.
              </p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-neige/50 border-b border-ligne">
                    <th className="px-5 py-3 font-medium">Chantier</th>
                    <th className="px-5 py-3 font-medium">Statut</th>
                    <th className="px-5 py-3 font-medium">Surface</th>
                    <th className="px-5 py-3 font-medium">Avancement</th>
                  </tr>
                </thead>
                <tbody>
                  {chantiers.map((c) => (
                    <tr key={c.id} className="border-b border-ligne last:border-0 hover:bg-sable/40">
                      <td className="px-5 py-4">
                        <Link href={`/chantiers/${c.id}`} className="font-medium text-neige hover:text-rouille">
                          {c.nom}
                        </Link>
                        <div className="text-xs text-neige/50">{c.ville}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`badge badge-${c.statut}`}>{labelStatut[c.statut] ?? c.statut}</span>
                      </td>
                      <td className="px-5 py-4 font-mono">{c.surface_totale_m2} m²</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-28 h-2 bg-sable rounded-full overflow-hidden">
                            <div className="h-full bg-vert" style={{ width: `${c.avancement_pct}%` }} />
                          </div>
                          <span className="font-mono text-xs">{c.avancement_pct}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
    </>
  );
}
