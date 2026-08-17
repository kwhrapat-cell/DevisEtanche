"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { LigneDevis } from "@/lib/types";

const STATUTS: { valeur: string; label: string }[] = [
  { valeur: "brouillon", label: "Brouillon" },
  { valeur: "envoye", label: "Envoyé" },
  { valeur: "accepte", label: "Accepté" },
  { valeur: "refuse", label: "Refusé" },
];

export default function StatutDevisForm({
  devisId,
  statutActuel,
  factureId,
  entrepriseId,
  chantierId,
  clientId,
  lignes,
  totalHt,
  tvaPct,
  totalTtc,
}: {
  devisId: string;
  statutActuel: string;
  factureId: string | null;
  entrepriseId: string;
  chantierId: string;
  clientId: string;
  lignes: LigneDevis[];
  totalHt: number;
  tvaPct: number;
  totalTtc: number;
}) {
  const [statut, setStatut] = useState(statutActuel);
  const [chargement, setChargement] = useState(false);
  const [chargementFacture, setChargementFacture] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const router = useRouter();

  async function changerStatut(nouveauStatut: string) {
    if (nouveauStatut === statut) return;
    setChargement(true);
    setErreur(null);
    const supabase = createClient();
    const { error } = await supabase.from("devis").update({ statut: nouveauStatut }).eq("id", devisId);
    setChargement(false);
    if (error) {
      setErreur("Le statut n'a pas pu être mis à jour.");
      return;
    }
    setStatut(nouveauStatut);
    router.refresh();
  }

  async function genererFacture() {
    setChargementFacture(true);
    setErreur(null);
    const supabase = createClient();
    const numero = `FAC-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const dateEcheance = new Date();
    dateEcheance.setDate(dateEcheance.getDate() + 30);

    const { data, error } = await supabase
      .from("factures")
      .insert({
        entreprise_id: entrepriseId,
        devis_id: devisId,
        chantier_id: chantierId,
        client_id: clientId,
        numero,
        statut: "a_payer",
        lignes,
        total_ht: totalHt,
        tva_pct: tvaPct,
        total_ttc: totalTtc,
        date_echeance: dateEcheance.toISOString().slice(0, 10),
      })
      .select("id")
      .single();

    setChargementFacture(false);
    if (error || !data) {
      setErreur("La facture n'a pas pu être générée.");
      return;
    }
    router.push(`/factures/${data.id}`);
  }

  return (
    <div className="print:hidden flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
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

      {erreur && <div className="text-xs text-[#FF8A80]">{erreur}</div>}

      {factureId ? (
        <Link href={`/factures/${factureId}`} className="text-sm text-rouille font-medium">
          Voir la facture →
        </Link>
      ) : statut === "accepte" ? (
        <button
          type="button"
          onClick={genererFacture}
          disabled={chargementFacture}
          className="self-start bg-rouille text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-60"
        >
          {chargementFacture ? "Génération…" : "Générer la facture"}
        </button>
      ) : null}
    </div>
  );
}
