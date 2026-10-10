import { Layers } from "@/components/icons";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import AjouterZoneForm from "../AjouterZoneForm";
import ZoneCard from "../ZoneCard";
import type { Zone } from "../types";

/**
 * Onglet « Plan » : les zones du chantier et leur statut.
 * L'étape 4 de la refonte y ajoutera l'image du plan avec les zones dessinées dessus.
 */
export default function OngletPlan({ chantierId, zones }: { chantierId: string; zones: Zone[] }) {
  return (
    <Card className="p-5">
      <CardHeader titre="Zones" sousTitre="Touchez une zone pour changer son statut." />
      {zones.length === 0 ? (
        <EmptyState icone={Layers} titre="Aucune zone définie" texte="Découpez le chantier en zones (terrasse, toiture, local technique…) pour suivre l'avancement." />
      ) : (
        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {zones.map((z) => (
            <ZoneCard key={z.id} zone={z} />
          ))}
        </div>
      )}
      <div className="border-t border-ligne pt-4">
        <AjouterZoneForm chantierId={chantierId} />
      </div>
    </Card>
  );
}
