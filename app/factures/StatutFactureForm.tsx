"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const STATUTS: { valeur: string; label: string }[] = [
  { valeur: "a_payer", label: "À payer" },
  { valeur: "payee", label: "Payée" },
  { valeur: "annulee", label: "Annulée" },
];

export default function StatutFactureForm({ factureId, statutActuel }: { factureId: string; statutActuel: string }) {
  const [statut, setStatut] = useState(statutActuel);
  const [chargement, setChargement] = useState(false);
  const router = useRouter();

  async function changerStatut(nouveauStatut: string) {
    if (nouveauStatut === statut) return;
    setChargement(true);
    const supabase = createClient();
    const { error } = await supabase.from("factures").update({ statut: nouveauStatut }).eq("id", factureId);
    setChargement(false);
    if (!error) {
      setStatut(nouveauStatut);
      router.refresh();
    }
  }

  return (
    <div className="print:hidden flex flex-wrap items-center gap-2">
      <span className="text-xs font-mono text-neige/50">STATUT</span>
      {STATUTS.map((s) => (
        <button
          key={s.valeur}
          type="button"
          disabled={chargement}
          onClick={() => changerStatut(s.valeur)}
          className={`text-xs font-medium rounded-lg px-3 py-1.5 border transition disabled:opacity-50 ${
            statut === s.valeur ? "border-rouille bg-rouille/10 text-neige" : "border-ligne text-neige/60"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
