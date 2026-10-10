import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/Progress";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { infoStatut, ORDRE_STATUTS_ZONE, TONS } from "@/lib/statuts";
import { cn } from "@/lib/utils";
import InvitationsSection from "../InvitationsSection";
import LienClientButton from "../LienClientButton";
import { formatDate, lienOnglet, type Photo, type Zone } from "../types";

/** Onglet « Vue d'ensemble » : avancement, informations, suivi client, dernières photos. */
export default function OngletApercu({
  chantier,
  zones,
  photos,
  invitations,
}: {
  chantier: any;
  zones: Zone[];
  photos: Photo[];
  /** null : l'utilisateur n'est pas administrateur, la section sous-traitance est masquée. */
  invitations: any[] | null;
}) {
  const infos = [
    { label: "Client", valeur: chantier.clients?.nom ?? "Sans client" },
    { label: "Ville", valeur: chantier.ville ?? "—" },
    { label: "Système d'étanchéité", valeur: chantier.systeme ? chantier.systeme.charAt(0).toUpperCase() + chantier.systeme.slice(1) : "Non défini" },
    { label: "Surface totale", valeur: chantier.surface_totale_m2 ? `${chantier.surface_totale_m2} m²` : "—" },
    { label: "Début", valeur: formatDate(chantier.date_debut) },
    { label: "Fin prévue", valeur: formatDate(chantier.date_fin_prevue) },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-4 sm:gap-6 lg:col-span-2">
        <Card className="flex items-center gap-5 p-5">
          <ProgressRing valeur={chantier.avancement_pct ?? 0} taille={104} epaisseur={9} />
          <div className="min-w-0 flex-1">
            <div className="mb-3 text-sm font-medium text-encre/70">Avancement global</div>
            {zones.length === 0 ? (
              <Link href={lienOnglet(chantier.id, "plan")} className="text-sm font-medium text-primaire hover:underline">
                Ajouter des zones pour suivre l'avancement
              </Link>
            ) : (
              <ul className="flex flex-col gap-2">
                {ORDRE_STATUTS_ZONE.map((s) => {
                  const { label, ton } = infoStatut("zone", s);
                  const nombre = zones.filter((z) => z.statut === s).length;
                  return (
                    <li key={s} className="flex items-center gap-2 text-sm">
                      <span className={cn("h-2.5 w-2.5 rounded-full", TONS[ton].point)} aria-hidden="true" />
                      <span className="flex-1 text-encre/70">{label}</span>
                      <span className="font-semibold tabular-nums text-encre">{nombre}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <CardHeader titre="Informations" action={<StatusBadge domaine="chantier" statut={chantier.statut} />} />
          <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
            {infos.map(({ label, valeur }) => (
              <div key={label} className="min-w-0">
                <dt className="text-xs text-encre/60">{label}</dt>
                <dd className="mt-0.5 truncate text-sm font-medium text-encre">{valeur}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card className="p-5">
          <CardHeader
            titre="Dernières photos"
            action={
              photos.length > 0 && (
                <Link href={lienOnglet(chantier.id, "photos")} className="text-sm font-medium text-primaire hover:underline">
                  Voir tout
                </Link>
              )
            }
          />
          {photos.length === 0 ? (
            <Link href={lienOnglet(chantier.id, "photos")} className="text-sm font-medium text-primaire hover:underline">
              Prendre la première photo
            </Link>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {photos.slice(0, 4).map((p) => (
                <img key={p.id} src={p.url} alt={p.legende ?? "Photo de chantier"} className="aspect-square w-full rounded-lg object-cover" />
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        <Card className="p-5">
          <CardHeader titre="Suivi client" sousTitre="Un lien à envoyer au client pour qu'il suive l'avancement, sans compte." />
          <LienClientButton token={chantier.token_public} />
        </Card>
        {invitations && (
          <InvitationsSection
            chantierId={chantier.id}
            entrepriseId={chantier.entreprise_id}
            chantierTermine={chantier.statut === "termine"}
            invitationsInitiales={invitations}
          />
        )}
      </div>
    </div>
  );
}
