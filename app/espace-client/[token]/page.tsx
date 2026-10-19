import Link from "next/link";
import Logo from "@/components/Logo";
import { CircleAlert, MapPin } from "@/components/icons";
import { Card, CardHeader } from "@/components/ui/Card";
import { FriseEtapes } from "@/components/ui/FriseEtapes";
import { ProgressBar, ProgressRing } from "@/components/ui/Progress";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { infoStatut } from "@/lib/statuts";
import { createClient } from "@/lib/supabase/server";

const formatDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : null;

/** Espace client public : suivi du chantier via le lien personnel (sans compte). */
export default async function EspaceClientPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("espace_client_chantier", { p_token: token });

  const chantier = data?.chantier;
  const zones: { nom: string; avancement_pct: number | null; statut: string }[] = data?.zones ?? [];
  const photos: { url: string }[] = data?.photos ?? [];

  if (error || !chantier) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-fond p-4">
        <Card className="flex max-w-sm flex-col items-center p-8 text-center">
          <CircleAlert size={32} className="mb-3 text-encre/50" />
          <h1 className="mb-2 font-semibold text-encre">Lien introuvable</h1>
          <p className="text-sm text-encre/60">Ce lien de suivi n'est plus valide. Contactez votre entreprise d'étanchéité.</p>
        </Card>
      </div>
    );
  }

  const termine = chantier.statut === "termine";
  const debut = formatDate(chantier.date_debut);
  const finPrevue = formatDate(chantier.date_fin_prevue);

  return (
    <div className="min-h-screen bg-fond">
      <header className="bg-marine px-4 pb-8 pt-6 text-white sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex items-center gap-3">
            <Logo clair />
            <span className="text-sm text-white/60">Suivi de chantier</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{chantier.nom}</h1>
          {chantier.ville && (
            <p className="mt-1 flex items-center gap-1 text-sm text-white/70">
              <MapPin size={15} className="shrink-0" />
              {chantier.ville}
            </p>
          )}
        </div>
      </header>

      <main className="mx-auto -mt-4 flex max-w-2xl flex-col gap-4 px-4 pb-8 sm:gap-6 sm:px-6">
        <Card className="flex items-center gap-5 p-5">
          <ProgressRing valeur={termine ? 100 : chantier.avancement_pct ?? 0} taille={104} epaisseur={9} />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-encre/70">Avancement</div>
            <StatusBadge domaine="chantier" statut={chantier.statut} className="mt-2" />
            {(debut || finPrevue) && (
              <dl className="mt-3 flex flex-col gap-1 text-sm">
                {debut && (
                  <div className="flex gap-1.5">
                    <dt className="whitespace-nowrap text-encre/60">Début :</dt>
                    <dd className="font-medium text-encre">{debut}</dd>
                  </div>
                )}
                {finPrevue && (
                  <div className="flex gap-1.5">
                    <dt className="whitespace-nowrap text-encre/60">Fin prévue :</dt>
                    <dd className="font-medium text-encre">{finPrevue}</dd>
                  </div>
                )}
              </dl>
            )}
          </div>
        </Card>

        {/* `etape` n'est renvoyée qu'après supabase/migration-etapes-chantier.sql. */}
        {"etape" in chantier && (
          <Card className="p-5">
            <CardHeader titre="Où en est votre chantier ?" />
            <FriseEtapes etape={chantier.etape} termine={termine} />
          </Card>
        )}

        {zones.length > 0 && (
          <Card className="p-5">
            <CardHeader titre="Avancement par zone" />
            <ul className="flex flex-col divide-y divide-ligne">
              {zones.map((z, i) => (
                <li key={i} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate font-medium text-encre">{z.nom}</span>
                    <StatusBadge domaine="zone" statut={z.statut} />
                  </div>
                  <ProgressBar
                    valeur={z.statut === "termine" ? 100 : z.avancement_pct ?? 0}
                    ton={infoStatut("zone", z.statut).ton}
                    afficherValeur
                  />
                </li>
              ))}
            </ul>
          </Card>
        )}

        {photos.length > 0 && (
          <Card className="p-5">
            <CardHeader titre="Dernières photos" />
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {photos.map((p, i) => (
                <a key={i} href={p.url} target="_blank" rel="noreferrer">
                  <img src={p.url} alt="Photo du chantier" className="aspect-square w-full rounded-lg object-cover" />
                </a>
              ))}
            </div>
          </Card>
        )}

        <p className="text-center text-xs text-encre/60">Ce lien est personnel — ne le partagez pas.</p>
        {/* Le client final (syndic, propriétaire, donneur d'ordre) découvre l'outil : source suivie dans les demandes pilote. */}
        <p className="text-center text-xs text-encre/60">
          Suivi proposé par votre entreprise avec DevisEtanche.{" "}
          <Link href="/?source=espace-client" className="font-medium text-encre/80 underline underline-offset-2">
            Découvrir le logiciel
          </Link>
        </p>
      </main>
    </div>
  );
}
