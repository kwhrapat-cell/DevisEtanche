"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AjouterElementForm from "./AjouterElementForm";
import { ProgressBar } from "@/components/ui/Progress";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { infoStatut, ORDRE_STATUTS_ZONE, TONS } from "@/lib/statuts";
import { cn } from "@/lib/utils";
import { changerStatutZone } from "@/lib/zones";

export default function ZoneCard({ zone }: { zone: any }) {
  const [ouvert, setOuvert] = useState(false);
  const [statut, setStatut] = useState<string>(zone.statut);
  const router = useRouter();
  const { ton } = infoStatut("zone", statut);

  async function changerStatut(nouveau: string) {
    setOuvert(false);

    const precedent = statut;
    setStatut(nouveau);
    const erreur = await changerStatutZone(zone.id, nouveau);
    if (erreur) {
      setStatut(precedent);
      alert(erreur);
      return;
    }
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOuvert(!ouvert)}
        aria-expanded={ouvert}
        className={cn("flex h-32 w-full flex-col justify-between rounded-2xl border-2 p-4 text-left transition-shadow hover:shadow-carte", TONS[ton].teinte)}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="font-semibold text-encre">{zone.nom}</span>
          <StatusBadge domaine="zone" statut={statut} className="bg-surface/80" />
        </div>
        <div className="w-full">
          <div className="mb-1.5 text-xs text-encre/60">{zone.surface_m2} m²</div>
          <ProgressBar valeur={statut === "termine" ? 100 : zone.avancement_pct ?? 0} ton={ton} afficherValeur />
        </div>
      </button>

      {ouvert && (
        <div className="absolute left-0 top-full z-10 mt-1 w-full overflow-hidden rounded-xl border border-ligne bg-surface shadow-flottant">
          <div className="px-3 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-wider text-encre/50">Changer le statut</div>
          {ORDRE_STATUTS_ZONE.map((s) => {
            const def = infoStatut("zone", s);
            return (
              <button
                key={s}
                onClick={() => changerStatut(s)}
                className={cn("flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-encre hover:bg-sable", s === statut && "font-semibold")}
              >
                <span className={cn("h-2.5 w-2.5 rounded-full", TONS[def.ton].point)} aria-hidden="true" />
                {def.label}
              </button>
            );
          })}
          <div className="border-t border-ligne">
            <AjouterElementForm zoneId={zone.id} />
          </div>
        </div>
      )}
    </div>
  );
}
