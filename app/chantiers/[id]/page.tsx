import TopBar from "@/components/TopBar";
import { Activity, FileText, Image, LayoutDashboard, Map as IconePlan } from "@/components/icons";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs } from "@/components/ui/Tabs";
import { getUtilisateurCourant } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import OngletActivite from "./onglets/OngletActivite";
import OngletApercu from "./onglets/OngletApercu";
import OngletDocs from "./onglets/OngletDocs";
import OngletPlan from "./onglets/OngletPlan";
import PhotosSection from "./PhotosSection";
import { lienOnglet, ONGLETS, type CleOnglet, type DocumentChantier, type Photo, type Zone } from "./types";

export default async function ChantierDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ onglet?: string }>;
}) {
  const [{ id }, { onglet }] = await Promise.all([params, searchParams]);
  const ongletActif: CleOnglet = ONGLETS.includes(onglet as CleOnglet) ? (onglet as CleOnglet) : "apercu";

  const supabase = await createClient();
  const session = await getUtilisateurCourant();
  // Sous-traitant restreint : pas d'accès aux devis et factures (policies RLS).
  const restreint = !!session?.profile?.chantier_assigne_id;
  const estAdministrateur = session?.profile?.role === "administrateur" && !restreint;

  const [{ data: chantier }, { data: zones }, { data: photos }, { data: devis }, { data: factures }, { data: invitations }] = await Promise.all([
    supabase.from("chantiers").select("*, clients(nom)").eq("id", id).single(),
    supabase.from("zones").select("id, nom, surface_m2, statut, avancement_pct, created_at").eq("chantier_id", id).order("created_at"),
    supabase.from("photos").select("id, url, legende, created_at").eq("chantier_id", id).order("created_at", { ascending: false }),
    restreint
      ? Promise.resolve({ data: [] })
      : supabase.from("devis").select("id, numero, statut, total_ttc, created_at").eq("chantier_id", id).order("created_at", { ascending: false }),
    restreint
      ? Promise.resolve({ data: [] })
      : supabase.from("factures").select("id, numero, statut, total_ttc, created_at").eq("chantier_id", id).order("created_at", { ascending: false }),
    estAdministrateur
      ? supabase.from("invitations_soustraitance").select("*").eq("chantier_id", id).order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);

  if (!chantier) {
    return (
      <>
        <TopBar titre="Chantier introuvable" />
        <div className="p-4 text-sm text-encre/60 sm:p-8">Ce chantier n'existe pas ou vous n'y avez pas accès.</div>
      </>
    );
  }

  const listeZones = (zones ?? []) as Zone[];
  const listePhotos = (photos ?? []) as Photo[];
  const listeDevis = (devis ?? []) as DocumentChantier[];
  const listeFactures = (factures ?? []) as DocumentChantier[];
  const devise = session?.entreprise?.devise;

  const onglets = [
    { cle: "apercu", label: "Vue d'ensemble", labelCourt: "Aperçu", icone: LayoutDashboard },
    { cle: "plan", label: "Plan", icone: IconePlan, compteur: listeZones.length },
    { cle: "photos", label: "Photos", icone: Image, compteur: listePhotos.length },
    { cle: "docs", label: "Docs", icone: FileText, compteur: listeDevis.length + listeFactures.length },
    { cle: "activite", label: "Activité", icone: Activity },
  ].map((o) => ({ ...o, href: lienOnglet(chantier.id, o.cle as CleOnglet) }));

  return (
    <>
      <TopBar
        titre={chantier.nom}
        sousTitre={[chantier.ville, chantier.clients?.nom ?? "Sans client"].filter(Boolean).join(" · ")}
        action={<StatusBadge domaine="chantier" statut={chantier.statut} />}
      />

      <div className="px-4 sm:px-8">
        <Tabs onglets={onglets} actif={ongletActif} />
      </div>

      <div className="p-4 sm:p-8">
        {ongletActif === "apercu" && (
          <OngletApercu
            chantier={chantier}
            zones={listeZones}
            photos={listePhotos}
            invitations={estAdministrateur ? invitations ?? [] : null}
          />
        )}
        {ongletActif === "plan" && <OngletPlan chantierId={chantier.id} zones={listeZones} />}
        {ongletActif === "photos" && <PhotosSection chantierId={chantier.id} photosInitiales={listePhotos} />}
        {ongletActif === "docs" && <OngletDocs restreint={restreint} devis={listeDevis} factures={listeFactures} devise={devise} />}
        {ongletActif === "activite" && (
          <OngletActivite
            chantier={chantier}
            zones={listeZones}
            photos={listePhotos}
            devis={listeDevis}
            factures={listeFactures}
          />
        )}
      </div>
    </>
  );
}
