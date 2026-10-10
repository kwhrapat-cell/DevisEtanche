import Link from "next/link";
import TopBar from "@/components/TopBar";
import { Camera, FileText, HardHat, MapPin, Plus } from "@/components/icons";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar, ProgressRing } from "@/components/ui/Progress";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { STATUTS, TONS } from "@/lib/statuts";
import { getUtilisateurCourant } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { cn, tempsEcoule } from "@/lib/utils";

type ChantierResume = { id: string; nom: string; ville: string | null; statut: string; avancement_pct: number | null; surface_totale_m2: number | null };

/**
 * Avancement global = moyenne des chantiers en cours, pondérée par leur surface
 * (un chantier de 1 200 m² compte plus qu'une terrasse de 40 m²). Repli sur la
 * moyenne simple si les surfaces ne sont pas renseignées.
 */
function avancementGlobal(chantiers: ChantierResume[]): number {
  const enCours = chantiers.filter((c) => c.statut === "en_cours");
  if (enCours.length === 0) return 0;
  const surfaceTotale = enCours.reduce((s, c) => s + (c.surface_totale_m2 ?? 0), 0);
  if (surfaceTotale > 0) {
    return enCours.reduce((s, c) => s + (c.avancement_pct ?? 0) * (c.surface_totale_m2 ?? 0), 0) / surfaceTotale;
  }
  return enCours.reduce((s, c) => s + (c.avancement_pct ?? 0), 0) / enCours.length;
}

export default async function DashboardPage() {
  const session = await getUtilisateurCourant();
  const supabase = await createClient();
  const entrepriseId = session?.profile?.entreprise_id;

  const [{ data: chantiersTous }, { count: devisEnAttenteCount }, { data: devisRecents }] = entrepriseId
    ? await Promise.all([
        supabase
          .from("chantiers")
          .select("id, nom, ville, statut, avancement_pct, surface_totale_m2")
          .eq("entreprise_id", entrepriseId)
          .order("created_at", { ascending: false }),
        supabase.from("devis").select("id", { count: "exact", head: true }).eq("entreprise_id", entrepriseId).in("statut", ["brouillon", "envoye"]),
        supabase
          .from("devis")
          .select("id, numero, created_at, chantiers(nom)")
          .eq("entreprise_id", entrepriseId)
          .order("created_at", { ascending: false })
          .limit(5),
      ])
    : [{ data: [] }, { count: 0 }, { data: [] }];

  const tous = (chantiersTous ?? []) as ChantierResume[];
  const chantierIds = tous.map((c) => c.id);
  const { data: photosRecentes } =
    chantierIds.length > 0
      ? await supabase
          .from("photos")
          .select("id, legende, created_at, chantier_id")
          .in("chantier_id", chantierIds)
          .order("created_at", { ascending: false })
          .limit(5)
      : { data: [] };

  const chantierNomParId = new Map(tous.map((c) => [c.id, c.nom]));
  const chantiers = tous.slice(0, 5);

  const parStatut = (s: string) => tous.filter((c) => c.statut === s).length;
  const enCoursCount = parStatut("en_cours");
  const repartition = [
    { cle: "termine", nombre: parStatut("termine") },
    { cle: "en_cours", nombre: enCoursCount },
    { cle: "en_attente", nombre: parStatut("en_attente") + parStatut("en_preparation") },
  ] as const;

  const activite = [
    ...(devisRecents ?? []).map((d: any) => ({
      id: `devis-${d.id}`,
      type: "devis" as const,
      texte: `Devis ${d.numero} créé`,
      sousTexte: d.chantiers?.nom ?? "—",
      created_at: d.created_at as string,
    })),
    ...(photosRecentes ?? []).map((p: any) => ({
      id: `photo-${p.id}`,
      type: "photo" as const,
      texte: p.legende || "Photo ajoutée",
      sousTexte: chantierNomParId.get(p.chantier_id) ?? "—",
      created_at: p.created_at as string,
    })),
  ]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  const prenom = session?.profile?.nom?.split(" ")[0] ?? "";

  return (
    <>
      <TopBar
        titre={`Bonjour ${prenom} 👋`}
        sousTitre="Voici ce qui se passe aujourd'hui sur vos chantiers."
        action={
          <ButtonLink href="/chantiers/nouveau" icone={Plus} className="hidden sm:inline-flex">
            Nouveau chantier
          </ButtonLink>
        }
      />

      <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card className="col-span-2 flex items-center gap-5 p-5">
            <ProgressRing valeur={avancementGlobal(tous)} libelle="en cours" />
            <div className="min-w-0 flex-1">
              <div className="mb-3 text-sm font-medium text-encre/70">Avancement global</div>
              <ul className="flex flex-col gap-2">
                {repartition.map(({ cle, nombre }) => {
                  const { label, ton } = STATUTS.chantier[cle];
                  return (
                    <li key={cle} className="flex items-center gap-2 text-sm">
                      <span className={cn("h-2.5 w-2.5 rounded-full", TONS[ton].point)} aria-hidden="true" />
                      <span className="flex-1 text-encre/70">{cle === "termine" ? "Terminés" : label}</span>
                      <span className="font-semibold tabular-nums text-encre">{nombre}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Card>
          <StatCard label="Chantiers en cours" valeur={enCoursCount} icone={HardHat} ton="info" href="/chantiers" />
          <StatCard label="Devis en attente" valeur={devisEnAttenteCount ?? 0} icone={FileText} ton="alerte" indication="Brouillons et envoyés" href="/devis" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
          <Card className="p-5 lg:col-span-2">
            <CardHeader
              titre="Mes chantiers"
              action={
                tous.length > 0 && (
                  <Link href="/chantiers" className="text-sm font-medium text-primaire hover:underline">
                    Voir tout
                  </Link>
                )
              }
            />
            {chantiers.length === 0 ? (
              <EmptyState
                icone={HardHat}
                titre="Aucun chantier pour l'instant"
                texte="Créez votre premier chantier pour suivre son avancement zone par zone."
                action={
                  <ButtonLink href="/chantiers/nouveau" icone={Plus} taille="lg">
                    Créer un chantier
                  </ButtonLink>
                }
              />
            ) : (
              <ul className="-mx-2 flex flex-col">
                {chantiers.map((c) => (
                  <li key={c.id}>
                    <Link href={`/chantiers/${c.id}`} className="flex flex-col gap-2 rounded-xl px-2 py-3 transition-colors hover:bg-sable/60">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate font-medium text-encre">{c.nom}</div>
                          {c.ville && (
                            <div className="mt-0.5 flex items-center gap-1 text-xs text-encre/60">
                              <MapPin size={13} className="shrink-0" />
                              <span className="truncate">{c.ville}</span>
                            </div>
                          )}
                        </div>
                        <StatusBadge domaine="chantier" statut={c.statut} />
                      </div>
                      <ProgressBar valeur={c.avancement_pct ?? 0} afficherValeur />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <CardHeader titre="Activité récente" />
            {activite.length === 0 ? (
              <EmptyState titre="Rien à signaler" texte="Les devis et photos ajoutés apparaîtront ici." />
            ) : (
              <ul className="flex flex-col gap-4">
                {activite.map((a) => {
                  const IconeActivite = a.type === "devis" ? FileText : Camera;
                  return (
                    <li key={a.id} className="flex items-start gap-3">
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                          a.type === "devis" ? TONS.alerte.icone : TONS.info.icone
                        )}
                      >
                        <IconeActivite size={17} />
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-encre">{a.texte}</div>
                        <div className="truncate text-xs text-encre/60">
                          {a.sousTexte} · {tempsEcoule(a.created_at)}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
