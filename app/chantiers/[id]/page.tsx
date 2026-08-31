import TopBar from "@/components/TopBar";
import { createClient } from "@/lib/supabase/server";
import { getUtilisateurCourant } from "@/lib/supabase/auth";
import AjouterZoneForm from "./AjouterZoneForm";
import PhotosSection from "./PhotosSection";
import LienClientButton from "./LienClientButton";
import ZoneCard from "./ZoneCard";
import InvitationsSection from "./InvitationsSection";

const couleurStatut: Record<string, string> = {
  termine: "bg-vert",
  en_cours: "bg-ambre",
  en_attente: "bg-[#3A4A63]",
  probleme: "bg-[#C64A2C]",
};

export default async function ChantierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const session = await getUtilisateurCourant();

  const { data: chantier } = await supabase.from("chantiers").select("*, clients(nom)").eq("id", id).single();
  const { data: zones } = await supabase.from("zones").select("*").eq("chantier_id", id).order("created_at");
  const { data: photos } = await supabase.from("photos").select("*").eq("chantier_id", id).order("created_at", { ascending: false });

  const estAdministrateur = session?.profile?.role === "administrateur" && !session.profile.chantier_assigne_id;
  const estDonneurOrdre = session?.profile?.role === "donneur_ordre";
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
          <div className="p-4 sm:p-8 text-sm text-neige/50">Ce chantier n'existe pas ou vous n'y avez pas accès.</div>
      </>
    );
  }

  return (
    <>
        <TopBar titre={chantier.nom} sousTitre={`${chantier.ville ?? ""} · ${chantier.clients?.nom ?? "Sans client"}`} />
        <div className="p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-neige">Zones</h2>
            </div>
            {!zones || zones.length === 0 ? (
              <p className="text-sm text-neige/50 mb-4">Aucune zone définie pour l'instant.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 mb-6">
                {zones.map((z) => (
                  <ZoneCard key={z.id} zone={z} lectureSeule={estDonneurOrdre} />
                ))}
          </div>
           )}
</div>


          <div className="flex flex-col gap-4">
            <div className="card p-5">
              <div className="text-xs text-neige/50 mb-2">Avancement global</div>
              <div className="font-mono text-3xl font-semibold text-neige">{chantier.avancement_pct}%</div>
              <div className="text-xs text-neige/50 mt-1">Surface totale {chantier.surface_totale_m2} m²</div>
            </div>
            <div className="card p-5">
              <div className="text-xs text-neige/50 mb-2">Système d'étanchéité</div>
              <div className="font-medium text-neige text-sm capitalize">{chantier.systeme ?? "non défini"}</div>
            </div>
            <div className="card p-5">
              <div className="text-xs text-neige/50 mb-2">Statut</div>
              <span className={`badge badge-${chantier.statut}`}>{chantier.statut?.replace(/_/g, " ")}</span>
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
            <PhotosSection chantierId={chantier.id} photosInitiales={photos ?? []} lectureSeule={estDonneurOrdre} />
          </div>
        </div>
    </>
  );
}
