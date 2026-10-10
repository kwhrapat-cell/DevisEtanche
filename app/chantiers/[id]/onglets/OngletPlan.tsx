import { Layers, Map as IconePlan } from "@/components/icons";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import AjouterZoneForm from "../AjouterZoneForm";
import ChoixPlanButton from "../plan/ChoixPlanButton";
import PlanInteractif from "../plan/PlanInteractif";
import ZoneCard from "../ZoneCard";
import type { Zone } from "../types";

/** Onglet « Plan » : le plan interactif du chantier, puis la liste des zones. */
export default function OngletPlan({
  chantierId,
  planUrl,
  zones,
  peutChangerPlan,
}: {
  chantierId: string;
  planUrl: string | null;
  zones: Zone[];
  /** Un sous-traitant restreint ne peut pas modifier la fiche chantier (policies RLS). */
  peutChangerPlan: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {planUrl ? (
        <PlanInteractif chantierId={chantierId} planUrl={planUrl} zones={zones} peutChangerPlan={peutChangerPlan} />
      ) : (
        <Card>
          <EmptyState
            icone={IconePlan}
            titre="Aucun plan pour ce chantier"
            texte={
              peutChangerPlan
                ? "Ajoutez une photo ou une image du plan, puis dessinez vos zones dessus pour suivre l'avancement d'un coup d'œil."
                : "Le plan n'a pas encore été ajouté par l'entreprise."
            }
            action={peutChangerPlan && <ChoixPlanButton chantierId={chantierId} />}
          />
        </Card>
      )}

      <Card className="p-5">
        <CardHeader titre="Zones" sousTitre="Touchez une zone pour changer son statut." />
        {zones.length === 0 ? (
          <EmptyState icone={Layers} titre="Aucune zone définie" texte="Découpez le chantier en zones (terrasse, toiture, local technique…) pour suivre l'avancement." />
        ) : (
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {zones.map((z) => (
              <ZoneCard key={z.id} zone={z} lectureSeule={!peutChangerPlan} />
            ))}
          </div>
        )}
        {peutChangerPlan && (
          <div className="border-t border-ligne pt-4">
            <AjouterZoneForm chantierId={chantierId} />
          </div>
        )}
      </Card>
    </div>
  );
}
