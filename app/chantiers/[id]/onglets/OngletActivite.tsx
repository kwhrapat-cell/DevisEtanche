import { Camera, FileText, HardHat, Layers, Receipt, type Icon } from "@/components/icons";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { TONS, type Ton } from "@/lib/statuts";
import { cn, tempsEcoule } from "@/lib/utils";
import { formatDate, type DocumentChantier, type Photo, type Zone } from "../types";

interface Evenement {
  id: string;
  texte: string;
  icone: Icon;
  ton: Ton;
  date: string;
}

/** Onglet « Activité » : tout ce qui s'est passé sur le chantier, du plus récent au plus ancien. */
export default function OngletActivite({
  chantier,
  zones,
  photos,
  devis,
  factures,
}: {
  chantier: any;
  zones: Zone[];
  photos: Photo[];
  devis: DocumentChantier[];
  factures: DocumentChantier[];
}) {
  const evenements: Evenement[] = [
    ...photos.map((p) => ({ id: `photo-${p.id}`, texte: p.legende || "Photo ajoutée", icone: Camera, ton: "info" as Ton, date: p.created_at })),
    ...zones.map((z) => ({ id: `zone-${z.id}`, texte: `Zone « ${z.nom} » créée`, icone: Layers, ton: "violet" as Ton, date: z.created_at })),
    ...devis.map((d) => ({ id: `devis-${d.id}`, texte: `Devis ${d.numero} créé`, icone: FileText, ton: "alerte" as Ton, date: d.created_at })),
    ...factures.map((f) => ({ id: `facture-${f.id}`, texte: `Facture ${f.numero} émise`, icone: Receipt, ton: "succes" as Ton, date: f.created_at })),
    ...(chantier.created_at
      ? [{ id: "chantier", texte: "Chantier créé", icone: HardHat, ton: "neutre" as Ton, date: chantier.created_at as string }]
      : []),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (evenements.length === 0) {
    return (
      <Card>
        <EmptyState titre="Aucune activité" texte="Les zones, photos et documents ajoutés apparaîtront ici." />
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <ol className="flex flex-col">
        {evenements.map(({ id, texte, icone: IconeEvenement, ton, date }, i) => (
          <li key={id} className="relative flex gap-3 pb-5 last:pb-0">
            {/* Trait vertical qui relie les événements */}
            {i < evenements.length - 1 && <span className="absolute bottom-0 left-[17px] top-9 w-px bg-ligne" aria-hidden="true" />}
            <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", TONS[ton].icone)}>
              <IconeEvenement size={17} />
            </span>
            <div className="min-w-0 pt-1">
              <div className="text-sm font-medium text-encre">{texte}</div>
              <div className="text-xs text-encre/60">
                {formatDate(date)} · {tempsEcoule(date)}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
