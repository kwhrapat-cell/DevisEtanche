import Link from "next/link";
import { redirect } from "next/navigation";
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

function tempsEcoule(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.floor(h / 24);
  if (j === 1) return "hier";
  return `il y a ${j} j`;
}

export default async function DashboardPage() {
  const session = await getUtilisateurCourant();

  // Le tableau de bord entreprise (devis/factures/marges) n'a pas de sens pour
  // un donneur d'ordre, qui suit son propre portefeuille de chantiers.
  if (session?.profile?.role === "donneur_ordre") {
    redirect("/portefeuille");
  }

  const supabase = await createClient();
  const entrepriseId = session?.profile?.entreprise_id;

  const [{ data: chantiersTous }, { count: enCoursCount }, { count: devisEnAttenteCount }, { data: devisRecents }] = entrepriseId
    ? await Promise.all([
        supabase
          .from("chantiers")
          .select("id, nom, ville, statut, avancement_pct")
          .eq("entreprise_id", entrepriseId)
          .order("created_at", { ascending: false }),
        supabase.from("chantiers").select("id", { count: "exact", head: true }).eq("entreprise_id", entrepriseId).eq("statut", "en_cours"),
        supabase.from("devis").select("id", { count: "exact", head: true }).eq("entreprise_id", entrepriseId).in("statut", ["brouillon", "envoye"]),
        supabase
          .from("devis")
          .select("id, numero, created_at, chantiers(nom)")
          .eq("entreprise_id", entrepriseId)
          .order("created_at", { ascending: false })
          .limit(5),
      ])
    : [{ data: [] }, { count: 0 }, { count: 0 }, { data: [] }];

  const chantierIds = (chantiersTous ?? []).map((c) => c.id);
  const { data: photosRecentes } =
    chantierIds.length > 0
      ? await supabase
          .from("photos")
          .select("id, legende, created_at, chantier_id")
          .in("chantier_id", chantierIds)
          .order("created_at", { ascending: false })
          .limit(5)
      : { data: [] };

  const chantierNomParId = new Map((chantiersTous ?? []).map((c) => [c.id, c.nom]));
  const chantiers = (chantiersTous ?? []).slice(0, 5);

  const activite = [
    ...(devisRecents ?? []).map((d: any) => ({
      id: `devis-${d.id}`,
      icone: "▤",
      texte: `Devis ${d.numero} créé`,
      sousTexte: d.chantiers?.nom ?? "—",
      created_at: d.created_at as string,
    })),
    ...(photosRecentes ?? []).map((p: any) => ({
      id: `photo-${p.id}`,
      icone: "▣",
      texte: p.legende || "Photo ajoutée",
      sousTexte: chantierNomParId.get(p.chantier_id) ?? "—",
      created_at: p.created_at as string,
    })),
  ]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  const nom = session?.profile?.nom?.split(" ")[0] ?? "";

  return (
    <>
        <TopBar titre={`Bonjour ${nom} 👋`} sousTitre="Voici ce qui se passe aujourd'hui sur vos chantiers." />
        <div className="p-4 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <StatCard
              label="Chantiers en cours"
              value={String(enCoursCount ?? 0)}
              icon="◧"
              iconColor="#8FB4FF"
              iconBg="rgba(143,180,255,0.14)"
            />
            <StatCard
              label="Devis en attente"
              value={String(devisEnAttenteCount ?? 0)}
              icon="▤"
              iconColor="#FFAD7A"
              iconBg="rgba(255,173,122,0.14)"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card p-6">
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
                    <Link key={c.id} href={`/chantiers/${c.id}`} className="flex flex-wrap items-center gap-y-2 gap-x-3 py-3 hover:bg-sable/30 -mx-2 px-2 rounded-lg">
                      <div className="flex-1 min-w-[140px]">
                        <div className="font-medium text-sm text-neige">{c.nom}</div>
                        <div className="text-xs text-neige/50">{c.ville}</div>
                      </div>
                      <span className={`badge badge-${c.statut}`}>{labelStatut[c.statut] ?? c.statut}</span>
                      <div className="flex items-center gap-2 ml-auto sm:ml-0">
                        <div className="w-16 sm:w-40 h-2 bg-sable rounded-full overflow-hidden">
                          <div className="h-full bg-vert" style={{ width: `${c.avancement_pct}%` }} />
                        </div>
                        <span className="font-mono text-xs text-neige/60 w-10 text-right">{c.avancement_pct}%</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-6">
              <h2 className="font-display font-semibold text-neige mb-4">Activité récente</h2>
              {activite.length === 0 ? (
                <p className="text-sm text-neige/50 py-6 text-center">Rien à signaler pour l'instant.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {activite.map((a) => (
                    <div key={a.id} className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-md bg-sable flex items-center justify-center text-xs shrink-0 text-neige/70">
                        {a.icone}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm text-neige truncate">{a.texte}</div>
                        <div className="text-xs text-neige/45">{a.sousTexte} · {tempsEcoule(a.created_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
    </>
  );
}
