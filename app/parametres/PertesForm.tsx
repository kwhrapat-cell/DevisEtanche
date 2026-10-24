"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PERTES_MAX_PCT, REGLAGES_PERTES_PAR_DEFAUT, type ReglagesPertes } from "@/lib/calc/etancheite";

const CHAMPS: { cle: keyof ReglagesPertes; colonne: string; label: string; aide: string }[] = [
  { cle: "recouvrementBicouchePct", colonne: "recouvrement_bicouche_pct", label: "RECOUVREMENTS BICOUCHE (%)", aide: "Ajoutés à la surface, pour chaque couche" },
  { cle: "recouvrementPvcPct", colonne: "recouvrement_pvc_pct", label: "RECOUVREMENTS PVC (%)", aide: "Ajoutés à la surface de membrane" },
  { cle: "pertesResinePct", colonne: "pertes_resine_pct", label: "PERTES RÉSINE (%)", aide: "Ajoutées à la surface à traiter" },
  { cle: "chuteRouleauxPct", colonne: "chute_rouleaux_pct", label: "CHUTE À LA COUPE (%)", aide: "Ajoutée au calcul du nombre de rouleaux" },
];

/**
 * Pertes et chutes de l'entreprise (Paramètres). Utilisées par le calculateur et par
 * l'ajout d'un produit du catalogue dans un devis.
 */
export default function PertesForm({ entrepriseId, reglages }: { entrepriseId: string; reglages: ReglagesPertes }) {
  const [valeurs, setValeurs] = useState<ReglagesPertes>(reglages);
  const [chargement, setChargement] = useState(false);
  const [enregistre, setEnregistre] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const router = useRouter();

  function changer(cle: keyof ReglagesPertes, texte: string) {
    setEnregistre(false);
    setValeurs((prev) => ({ ...prev, [cle]: texte === "" ? Number.NaN : parseFloat(texte.replace(",", ".")) }));
  }

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setEnregistre(false);

    const horsLimites = CHAMPS.find(({ cle }) => !(valeurs[cle] >= 0 && valeurs[cle] <= PERTES_MAX_PCT));
    if (horsLimites) {
      setErreur(`Chaque pourcentage doit être compris entre 0 et ${PERTES_MAX_PCT} %.`);
      return;
    }

    setChargement(true);
    const miseAJour = Object.fromEntries(CHAMPS.map(({ cle, colonne }) => [colonne, Math.round(valeurs[cle] * 10) / 10]));
    const { error } = await createClient().from("entreprises").update(miseAJour).eq("id", entrepriseId);
    setChargement(false);
    if (error) {
      setErreur("Les réglages n'ont pas pu être enregistrés. Réessayez plus tard.");
      return;
    }
    setEnregistre(true);
    router.refresh();
  }

  return (
    <form onSubmit={enregistrer} className="card p-5">
      <div className="font-medium text-encre mb-1">Pertes et chutes</div>
      <p className="text-xs text-encre/60 mb-3">
        Vos habitudes de pose, utilisées par le calculateur et pour compter les rouleaux dans vos devis.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-3">
        {CHAMPS.map(({ cle, label, aide }) => (
          <div key={cle}>
            <label htmlFor={`pertes-${cle}`} className="text-xs font-mono text-encre/70 block mb-1">
              {label}
            </label>
            <input
              id={`pertes-${cle}`}
              type="number"
              inputMode="decimal"
              min={0}
              max={PERTES_MAX_PCT}
              step={0.5}
              value={Number.isNaN(valeurs[cle]) ? "" : valeurs[cle]}
              onChange={(e) => changer(cle, e.target.value)}
              className="w-full min-h-[44px] border border-ligne rounded-lg px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-encre/60">{aide}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={chargement} className="min-h-[44px] text-sm bg-primaire text-white font-semibold rounded-lg px-4 py-2 disabled:opacity-60">
          {chargement ? "Enregistrement…" : "Enregistrer"}
        </button>
        <button
          type="button"
          onClick={() => {
            setValeurs(REGLAGES_PERTES_PAR_DEFAUT);
            setEnregistre(false);
          }}
          className="min-h-[44px] text-sm text-encre/70 underline-offset-2 hover:underline"
        >
          Valeurs usuelles
        </button>
        {enregistre && <span className="text-xs text-emerald-700">Enregistré</span>}
      </div>
      {erreur && <p className="mt-2 text-sm text-rouge">{erreur}</p>}
    </form>
  );
}
