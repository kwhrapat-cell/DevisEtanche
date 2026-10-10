import TopBar from "@/components/TopBar";
import { createClient } from "@/lib/supabase/server";
import { getUtilisateurCourant } from "@/lib/supabase/auth";
import AjouterZoneForm from "./AjouterZoneForm";
import PhotosSection from "./PhotosSection";
import LienClientButton from "./LienClientButton";
import ZoneCard from "./ZoneCard";
import InvitationsSection from "./InvitationsSection";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressRing } from "@/components/ui/Progress";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Layers } from "@/components/icons";

export default async function ChantierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const session = await getUtilisateurCourant();

  const { data: chantier } = await supabase.from("chantiers").select("*, clients(nom)").eq("id", id).single();
  const { data: zones } = await supabase.from("zones").select("*").eq("chantier_id", id).order("created_at");
  const { data: photos } = await supabase.from("photos").select("*").eq("chantier_id", id).order("created_at", { ascending: false });

  const estAdministrateur = session?.profile?.role === "administrateur" && !session.profile.chantier_assigne_id;
  const { data: invitations } = estAdministrateur
    ? await supabase
        .from("invitations_soustraitance")
        .select("*")
        .eq("chantier_id", id)
        .order("created_at", { ascending: false })
    : { data: [] };

  if (!chantier) {
    return (
      <>
          <TopBar titre="Chantier introuvable" />
          <div className="p-4 sm:p-8 text-sm text-encre/60">Ce chantier n'existe pas ou vous n'y avez pas accès.</div>
      </>
    );
  }

  return (
    <>
        <TopBar titre={chantier.nom} sousTitre={`${chantier.ville ?? ""} · ${chantier.clients?.nom ?? "Sans client"}`} />
        <div className="p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-5 lg:col-span-2">
            <CardHeader titre="Zones" sousTitre="Touchez une zone pour changer son statut." />
            {!zones || zones.length === 0 ? (
              <EmptyState icone={Layers} titre="Aucune zone définie" texte="Découpez le chantier en zones (terrasse, toiture, local technique…) pour suivre l'avancement." />
            ) : (
              <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {zones.map((z) => (
                  <ZoneCard key={z.id} zone={z} />
                ))}
              </div>
            )}
            <div className="border-t border-ligne pt-4">
              <AjouterZoneForm chantierId={chantier.id} />
            </div>
          </Card>

          <div className="flex flex-col gap-4">
            <Card className="flex items-center gap-5 p-5">
              <ProgressRing valeur={chantier.avancement_pct ?? 0} taille={96} epaisseur={9} />
              <div>
                <div className="text-sm font-medium text-encre/70">Avancement global</div>
                <div className="mt-1 text-sm text-encre/60">Surface totale {chantier.surface_totale_m2 ?? "—"} m²</div>
              </div>
            </Card>
            <div className="card p-5">
              <div className="text-xs text-encre/60 mb-2">Système d'étanchéité</div>
              <div className="font-medium text-encre text-sm capitalize">{chantier.systeme ?? "non défini"}</div>
            </div>
            <div className="card p-5">
              <div className="text-xs text-encre/60 mb-2">Statut</div>
              <StatusBadge domaine="chantier" statut={chantier.statut} />
              <LienClientButton token={chantier.token_public} />
            </div>
            {estAdministrateur && (
              <InvitationsSection
                chantierId={chantier.id}
                entrepriseId={chantier.entreprise_id}
                chantierTermine={chantier.statut === "termine"}
                invitationsInitiales={invitations ?? []}
              />
            )}
          </div>

          <div className="lg:col-span-3">
            <PhotosSection chantierId={chantier.id} photosInitiales={photos ?? []} />
          </div>
        </div>
    </>
  );
}
