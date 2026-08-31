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

export default async function PortefeuillePage() {
  const session = await getUtilisateurCourant();
  const supabase = await createClient();

  const { data: chantiers } = session?.user
    ? await supabase
        .from("chantiers")
        .select("id, nom, ville, statut, avancement_pct, entreprise_id")
        .eq("donneur_ordre_id", session.user.id)
        .order("created_at", { ascending: false })
    : { data: null };

  return (
    <>
      <TopBar titre="Portefeuille" sousTitre={`${chantiers?.length ?? 0} chantiers suivis`} />
      <div className="p-4 sm:p-8">
        <div className="mb-5 flex gap-3">
          <Link href="/portefeuille/nouveau" className="inline-flex items-center gap-2 bg-rouille text-white text-sm font-semibold px-4 py-2 rounded-lg">
            + Nouveau chantier
          </Link>
          <Link href="/portefeuille/code" className="inline-flex items-center gap-2 border border-ligne text-neige text-sm font-semibold px-4 py-2 rounded-lg">
            Générer un code de rattachement
          </Link>
        </div>

        {!chantiers || chantiers.length === 0 ? (
          <div className="card p-10 text-center">
            <div className="font-display font-semibold text-neige mb-2">Aucun chantier suivi pour l'instant</div>
            <p className="text-sm text-neige/50 mb-5 max-w-sm mx-auto">
              Créez un chantier puis générez un code pour l&apos;entreprise exécutante qui doit le rejoindre.
            </p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-neige/50 border-b border-ligne">
                    <th className="px-5 py-3 font-medium">Chantier</th>
                    <th className="px-5 py-3 font-medium">Statut</th>
                    <th className="px-5 py-3 font-medium">Entreprise exécutante</th>
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
                      <td className="px-5 py-4 text-xs text-neige/60">
                        {c.entreprise_id ? "Rattachée" : "En attente de rattachement"}
                      </td>
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
          </div>
        )}
      </div>
    </>
  );
}
