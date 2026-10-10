import TopBar from "@/components/TopBar";
import { ArrowRight, Calculator, FolderOpen, HardHat, MapPin, Plus } from "@/components/icons";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/Progress";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getUtilisateurCourant } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import PrendrePhotoButton from "./PrendrePhotoButton";

type ChantierDuJour = { id: string; nom: string; ville: string | null; statut: string; avancement_pct: number | null };

/**
 * Chantier du jour = le dernier chantier modifié qui n'est pas terminé.
 * `updated_at` vient de supabase/migration-chantiers-updated-at.sql : tant que la
 * migration n'est pas exécutée, on se rabat sur le dernier chantier créé.
 */
async function chargerChantierDuJour(): Promise<ChantierDuJour | null> {
  const supabase = await createClient();
  const requete = (tri: "updated_at" | "created_at") =>
    supabase
      .from("chantiers")
      .select("id, nom, ville, statut, avancement_pct")
      .neq("statut", "termine")
      .order(tri, { ascending: false })
      .limit(1)
      .maybeSingle();

  const { data, error } = await requete("updated_at");
  if (!error) return data;
  const { data: repli } = await requete("created_at");
  return repli;
}

/** Accueil « Mode Chantier » : l'écran d'arrivée des équipes de terrain. */
export default async function AccueilPage() {
  const [session, chantier] = await Promise.all([getUtilisateurCourant(), chargerChantierDuJour()]);
  const prenom = session?.profile?.nom?.split(" ")[0] ?? "";
  // Un sous-traitant restreint à un chantier ne peut pas en créer (policies RLS).
  const restreint = !!session?.profile?.chantier_assigne_id;

  return (
    <>
      <TopBar titre={`Bonjour ${prenom} 👋`} sousTitre="Que souhaitez-vous faire aujourd'hui ?" />

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 sm:gap-6 sm:p-8">
        <Card className="p-5">
          <CardHeader titre="Chantier du jour" />
          {chantier ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-lg font-semibold text-encre">{chantier.nom}</div>
                  {chantier.ville && (
                    <div className="mt-0.5 flex items-center gap-1 text-sm text-encre/60">
                      <MapPin size={14} className="shrink-0" />
                      <span className="truncate">{chantier.ville}</span>
                    </div>
                  )}
                </div>
                <StatusBadge domaine="chantier" statut={chantier.statut} />
              </div>
              <ProgressBar valeur={chantier.avancement_pct ?? 0} afficherValeur />
              <ButtonLink href={`/chantiers/${chantier.id}`} taille="lg" icone={ArrowRight} pleineLargeur className="sm:w-auto sm:self-start">
                Reprendre
              </ButtonLink>
            </div>
          ) : (
            <EmptyState icone={HardHat} titre="Aucun chantier en cours" texte="Les chantiers non terminés apparaîtront ici." />
          )}
        </Card>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ButtonLink href="/chantiers" taille="lg" variante="secondaire" icone={FolderOpen} pleineLargeur>
            Reprendre un chantier
          </ButtonLink>
          <PrendrePhotoButton chantierId={chantier?.id ?? null} chantierNom={chantier?.nom ?? null} />
          {!restreint && (
            <ButtonLink href="/chantiers/nouveau" taille="lg" variante="secondaire" icone={Plus} pleineLargeur>
              Nouveau chantier
            </ButtonLink>
          )}
          <ButtonLink href="/calculateur" taille="lg" variante="secondaire" icone={Calculator} pleineLargeur>
            Calcul rapide
          </ButtonLink>
        </div>
      </div>
    </>
  );
}
