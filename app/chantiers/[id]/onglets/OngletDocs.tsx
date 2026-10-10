import Link from "next/link";
import { FileText, Receipt } from "@/components/icons";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatMontant } from "@/lib/devise";
import { formatDate, type DocumentChantier } from "../types";

function ListeDocuments({
  titre,
  domaine,
  base,
  documents,
  devise,
}: {
  titre: string;
  domaine: "devis" | "facture";
  base: string;
  documents: DocumentChantier[];
  devise?: string;
}) {
  return (
    <Card className="p-5">
      <CardHeader titre={titre} />
      {documents.length === 0 ? (
        <EmptyState
          icone={domaine === "devis" ? FileText : Receipt}
          titre={domaine === "devis" ? "Aucun devis pour ce chantier" : "Aucune facture pour ce chantier"}
        />
      ) : (
        <ul className="-mx-2 flex flex-col">
          {documents.map((d) => (
            <li key={d.id}>
              <Link href={`${base}/${d.id}`} className="flex min-h-[44px] items-center justify-between gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-sable/60">
                <div className="min-w-0">
                  <div className="truncate font-medium text-encre">{d.numero}</div>
                  <div className="text-xs text-encre/60">{formatDate(d.created_at)}</div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-sm font-semibold tabular-nums text-encre">{formatMontant(Number(d.total_ttc ?? 0), devise)}</span>
                  <StatusBadge domaine={domaine} statut={d.statut} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

/** Onglet « Docs » : devis et factures du chantier. */
export default function OngletDocs({
  restreint,
  devis,
  factures,
  devise,
}: {
  restreint: boolean;
  devis: DocumentChantier[];
  factures: DocumentChantier[];
  devise?: string;
}) {
  if (restreint) {
    return (
      <Card>
        <EmptyState icone={FileText} titre="Documents réservés" texte="Les devis et factures de ce chantier sont visibles uniquement par l'entreprise." />
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
      <ListeDocuments titre="Devis" domaine="devis" base="/devis" documents={devis} devise={devise} />
      <ListeDocuments titre="Factures" domaine="facture" base="/factures" documents={factures} devise={devise} />
    </div>
  );
}
