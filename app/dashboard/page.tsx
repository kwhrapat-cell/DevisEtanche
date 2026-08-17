import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import StatCard from "@/components/StatCard";
import { getUtilisateurCourant } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

const labelStatut: Record<string, string> = {
  en_preparation: "en préparation",
  en_cours: "en cours",
  termine: "terminé",
  en_attente: "en attente",
};

export default async function DashboardPage() {
  const session = await getUtilisateurCourant();
  const supabase = await createClient();
  const entrepriseId = session?.profile?.entreprise_id;

  const [{ data: chantiers }, { count: enCoursCount }, { count: devisEnAttenteCount }] = entrepriseId
    ? await Promise.all([
        supabase
          .from("chantiers")
          .select("id, nom, ville, statut, avancement_pct")
          .eq("entreprise_id", entrepriseId)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase.from("chantiers").select("id", { count: "exact", head: true }).eq("entreprise_id", entrepriseId).eq("statut", "en_cours"),
        supabase.from("devis").select("id", { count: "exact", head: true }).eq("entreprise_id", entrepriseId).in("statut", ["brouillon", "envoye"]),
      ])
    : [{ data: [] }, { count: 0 }, { count: 0 }];

  const nom = session?.profile?.nom?.split(" ")[0] ?? "";

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">
        <TopBar titre={`Bonjour ${nom} 👋`} sousTitre="Voici ce qui se passe aujourd'hui sur vos chantiers." />
        <div className="p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <StatCard label="Chantiers en cours" value={String(enCoursCount ?? 0)} />
            <StatCard label="Devis en attente" value={String(devisEnAttenteCount ?? 0)} />
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-neige">Mes chantiers</h2>
              <Link href="/chantiers/nouveau" className="text-sm text-rouille font-medium">+ Nouveau chantier</Link>
            </div>
            {!chantiers || chantiers.length === 0 ? (
              <p className="text-sm text-neige/50 py-6 text-center">
                Aucun chantier pour l'instant. <Link href="/chantiers/nouveau" className="text-rouille font-medium">Créer le premier</Link>
              </p>
            ) : (
              <div className="flex flex-col divide-y divide-ligne">
                {chantiers.map((c) => (
                  <Link key={c.id} href={`/chantiers/${c.id}`} className="flex items-center justify-between py-3 hover:bg-sable/30 -mx-2 px-2 rounded-lg">
                    <div>
                      <div className="font-medium text-sm text-neige">{c.nom}</div>
                      <div className="text-xs text-neige/50">{c.ville}</div>
                    </div>
                    <span className={`badge badge-${c.statut}`}>{labelStatut[c.statut] ?? c.statut}</span>
                    <div className="w-40 h-2 bg-sable rounded-full overflow-hidden">
                      <div className="h-full bg-vert" style={{ width: `${c.avancement_pct}%` }} />
                    </div>
                    <span className="font-mono text-xs text-neige/60 w-10 text-right">{c.avancement_pct}%</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
