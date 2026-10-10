import { infoStatut, TONS, type Domaine } from "@/lib/statuts";
import { cn } from "@/lib/utils";

/** Pastille de statut — couleur et libellé viennent de lib/statuts.ts. */
export function StatusBadge({ domaine, statut, className }: { domaine: Domaine; statut: string | null | undefined; className?: string }) {
  const { label, ton } = infoStatut(domaine, statut);
  return (
    <span className={cn("badge", TONS[ton].badge, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", TONS[ton].point)} aria-hidden="true" />
      {label}
    </span>
  );
}
