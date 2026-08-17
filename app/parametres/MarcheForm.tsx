"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Devise } from "@/lib/devise";

const PRESETS: { devise: Devise; libelleTaxe: string; tauxDefaut: number; label: string }[] = [
  { devise: "XPF", libelleTaxe: "TGC", tauxDefaut: 11, label: "Nouvelle-Calédonie (XPF, TGC)" },
  { devise: "EUR", libelleTaxe: "TVA", tauxDefaut: 20, label: "France métropolitaine (EUR, TVA)" },
];

export default function MarcheForm({
  entrepriseId,
  devise: deviseInitiale,
  libelleTaxe: libelleTaxeInitial,
  tauxTaxeDefaut: tauxInitial,
}: {
  entrepriseId: string;
  devise: string;
  libelleTaxe: string;
  tauxTaxeDefaut: number;
}) {
  const presetInitial = PRESETS.findIndex((p) => p.devise === deviseInitiale && p.libelleTaxe === libelleTaxeInitial);
  const [preset, setPreset] = useState(presetInitial >= 0 ? presetInitial : 0);
  const [libelleTaxe, setLibelleTaxe] = useState(libelleTaxeInitial);
  const [tauxTaxeDefaut, setTauxTaxeDefaut] = useState(tauxInitial);
  const [chargement, setChargement] = useState(false);
  const [enregistre, setEnregistre] = useState(false);
  const router = useRouter();

  function appliquerPreset(index: number) {
    setPreset(index);
    setLibelleTaxe(PRESETS[index].libelleTaxe);
    setTauxTaxeDefaut(PRESETS[index].tauxDefaut);
  }

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setChargement(true);
    setEnregistre(false);
    const supabase = createClient();
    const { error } = await supabase
      .from("entreprises")
      .update({ devise: PRESETS[preset].devise, libelle_taxe: libelleTaxe, taux_taxe_defaut: tauxTaxeDefaut })
      .eq("id", entrepriseId);
    setChargement(false);
    if (!error) {
      setEnregistre(true);
      router.refresh();
    }
  }

  return (
    <form onSubmit={enregistrer} className="card p-5">
      <div className="font-medium text-neige mb-1">Marché</div>
      <p className="text-xs text-neige/50 mb-3">Détermine la devise et la taxe affichées sur vos devis.</p>

      <div className="flex flex-col gap-2 mb-3">
        {PRESETS.map((p, i) => (
          <button
            key={p.label}
            type="button"
            onClick={() => appliquerPreset(i)}
            className={`text-left text-sm rounded-lg px-3 py-2 border ${
              preset === i ? "border-rouille bg-rouille/10 text-neige" : "border-ligne text-neige/60"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex gap-3 mb-3">
        <div className="flex-1">
          <label className="text-xs font-mono text-neige/60 block mb-1">LIBELLÉ TAXE</label>
          <input value={libelleTaxe} onChange={(e) => setLibelleTaxe(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="w-28">
          <label className="text-xs font-mono text-neige/60 block mb-1">TAUX PAR DÉFAUT (%)</label>
          <input
            type="number"
            value={tauxTaxeDefaut}
            onChange={(e) => setTauxTaxeDefaut(parseFloat(e.target.value) || 0)}
            className="w-full border border-ligne rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={chargement} className="text-sm bg-rouille text-white font-semibold rounded-lg px-4 py-2 disabled:opacity-60">
          {chargement ? "Enregistrement…" : "Enregistrer"}
        </button>
        {enregistre && <span className="text-xs text-vert">Enregistré</span>}
      </div>
    </form>
  );
}
