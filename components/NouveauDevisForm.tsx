"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Props {
  entrepriseId: string | null;
  chantiers: { id: string; nom: string }[];
}

export default function NouveauDevisForm({ entrepriseId, chantiers }: Props) {
  const [chantierId, setChantierId] = useState(chantiers[0]?.id ?? "");
  const [montantHt, setMontantHt] = useState(0);
  const [ouvert, setOuvert] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);
  const router = useRouter();

  async function creerDevis(e: React.FormEvent) {
    e.preventDefault();
    if (!entrepriseId || !chantierId) {
      setErreur("Sélectionnez un chantier (créez-en un d'abord si la liste est vide).");
      return;
    }
    setChargement(true);
    setErreur(null);

    const tva = 11; // TVA Nouvelle-Calédonie par défaut, ajustable en Paramètres
    const totalTtc = Math.round(montantHt * (1 + tva / 100) * 100) / 100;
    const numero = `DEV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

    const supabase = createClient();
    const { error } = await supabase.from("devis").insert({
      entreprise_id: entrepriseId,
      chantier_id: chantierId,
      numero,
      statut: "brouillon",
      lignes: [],
      total_ht: montantHt,
      tva_pct: tva,
      total_ttc: totalTtc,
    });

    setChargement(false);
    if (error) {
      setErreur("Impossible d'enregistrer ce devis.");
      return;
    }
    setMontantHt(0);
    setOuvert(false);
    router.refresh();
  }

  if (!ouvert) {
    return (
      <button onClick={() => setOuvert(true)} className="self-start bg-rouille text-white text-sm font-semibold rounded-lg px-4 py-2.5">
        + Nouveau devis
      </button>
    );
  }

  return (
    <form onSubmit={creerDevis} className="card p-5 flex flex-col sm:flex-row gap-3 items-end">
      {erreur && <div className="text-sm text-[#C64A2C]">{erreur}</div>}
      <div className="flex-1 w-full">
        <label className="text-xs font-mono text-ardoise/60 block mb-1">CHANTIER</label>
        <select value={chantierId} onChange={(e) => setChantierId(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2">
          {chantiers.length === 0 && <option value="">Aucun chantier — créez-en un d'abord</option>}
          {chantiers.map((c) => (
            <option key={c.id} value={c.id}>{c.nom}</option>
          ))}
        </select>
      </div>
      <div className="w-full sm:w-44">
        <label className="text-xs font-mono text-ardoise/60 block mb-1">MONTANT HT</label>
        <input
          type="number"
          min={0}
          value={montantHt}
          onChange={(e) => setMontantHt(parseFloat(e.target.value) || 0)}
          className="w-full border border-ligne rounded-lg px-3 py-2"
        />
      </div>
      <button type="submit" disabled={chargement} className="bg-rouille text-white text-sm font-semibold rounded-lg px-4 py-2.5 disabled:opacity-60">
        {chargement ? "…" : "Créer le devis"}
      </button>
    </form>
  );
}
