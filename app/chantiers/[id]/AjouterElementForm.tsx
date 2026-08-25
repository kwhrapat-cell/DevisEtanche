"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ProduitEtancheite } from "@/lib/types";
import { suggererProduits, type TypeElementZone } from "@/lib/produits-aide";

const TYPES = [
  { value: "plot" , label: "Plot (clim, PV...)", unite: "unite" },
  {value: "releve", label: "Relevé équerre/alu", unite: "ml" },
  {value: "jardiniere", label: "Jardinière", unite: "m2" },
  {value: "skydome", label: "Skydome", unite: "unite" },
];

const TYPE_ELEMENT_CATALOGUE: Record<string, TypeElementZone> = {
  plot: "point_singulier",
  releve: "releve_equerre",
  jardiniere: "jardiniere",
  skydome: "point_singulier",
};

export default function AjouterElementForm({ zoneId }: { zoneId: string }) {
    const [ouvert, setOuvert] = useState(false);
    const [type, setType] = useState(TYPES[0].value);
    const [description, setDescription] = useState("");
    const [quantite, setQuantite] = useState("1");
    const [envoi, setEnvoi] = useState(false);
    const [catalogue, setCatalogue] = useState<ProduitEtancheite[]>([]);
    const router = useRouter();

    // Calcul interne (non visible client) : temps × taux horaire + prix matériaux
    // = un prix suggéré, que l'utilisateur peut ensuite ajuster librement.
    const [calcOuvert, setCalcOuvert] = useState(false);
    const [entrepriseId, setEntrepriseId] = useState<string | null>(null);
    const [tempsEstime, setTempsEstime] = useState("");
    const [tauxHoraire, setTauxHoraire] = useState("");
    const [prixMateriaux, setPrixMateriaux] = useState("");
    const [prixFinal, setPrixFinal] = useState("");
    const [prixFinalModifie, setPrixFinalModifie] = useState(false);

    const uniteActuelle = TYPES.find((t) => t.value === type)?.unite ?? "unite";

    useEffect(() => {
      if (!ouvert) return;
      const supabase = createClient();
      supabase.from("produits_etancheite").select("*").then(({ data }) => setCatalogue((data ?? []) as ProduitEtancheite[]));
      (async () => {
        const { data: userData } = await supabase.auth.getUser();
        const { data: profile } = await supabase.from("profiles").select("entreprise_id").eq("id", userData.user?.id).single();
        if (!profile) return;
        setEntrepriseId(profile.entreprise_id);
        const { data: entreprise } = await supabase
          .from("entreprises")
          .select("dernier_taux_horaire_interne")
          .eq("id", profile.entreprise_id)
          .single();
        if (entreprise?.dernier_taux_horaire_interne != null) {
          setTauxHoraire(String(entreprise.dernier_taux_horaire_interne));
        }
      })();
    }, [ouvert]);

    const suggestions = useMemo(
      () => suggererProduits(catalogue, TYPE_ELEMENT_CATALOGUE[type] ?? "point_singulier"),
      [catalogue, type]
    );

    const totalMainOeuvre = (Number(tempsEstime) || 0) * (Number(tauxHoraire) || 0);
    const prixSuggere = totalMainOeuvre + (Number(prixMateriaux) || 0);

    useEffect(() => {
      if (!prixFinalModifie) setPrixFinal(prixSuggere ? String(prixSuggere) : "");
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prixSuggere, prixFinalModifie]);

    async function ajouter() {
        setEnvoi(true);
        const supabase = createClient();
        await supabase.from("elements_zone").insert({
            zone_id: zoneId,
            type,
            description: description || null,
            quantite: Number(quantite) || 1,
            unite: uniteActuelle,
            temps_estime_heures: tempsEstime ? Number(tempsEstime) : null,
            taux_horaire_interne: tauxHoraire ? Number(tauxHoraire) : null,
            prix_materiaux: prixMateriaux ? Number(prixMateriaux) : null,
            prix_final: prixFinal ? Number(prixFinal) : null,
          });
          if (entrepriseId && tauxHoraire) {
            await supabase.from("entreprises").update({ dernier_taux_horaire_interne: Number(tauxHoraire) }).eq("id", entrepriseId);
          }
          setEnvoi(false);
          setOuvert(false);
          setDescription("");
          setQuantite("1");
          setCalcOuvert(false);
          setTempsEstime("");
          setPrixMateriaux("");
          setPrixFinal("");
          setPrixFinalModifie(false);
          router.refresh();
        }

        if (!ouvert) {
            return (
               <button
                 onClick={() => setOuvert(true)}
                 className="text-xs text-left px-3 py-2 text-neige/60 hover:bg-sable/40 w-full"
               >
                 + Ajouter un élément
                </button>
              );
        }

        return (
            <div className="p-3 border-t border-ligne flex flex-col gap-2">
              <select value={type} onChange={(e) => setType(e.target.value)} className="text-sm border border-ligne rounded px-2 py-1">
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
            </select>
            <input
              type="text"
              placeholder="Description (optionnel)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-sm border border-ligne rounded px-2 py-1"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={quantite}
              onChange={(e) => setQuantite(e.target.value)}
              className="text-sm border border-ligne rounded px-2 py-1"
            />
            <span className="text-xs text-neige/40">Unité : {uniteActuelle}</span>
            {suggestions.length > 0 && (
              <div className="text-xs text-neige/50">
                Produits recommandés :
                <ul className="list-disc list-inside">
                  {suggestions.map((p) => (
                    <li key={p.reference}>{p.fabricant} — {p.nom} <span className="text-neige/40">({p.reference})</span></li>
                  ))}
                </ul>
              </div>
            )}

            <div className="border border-ligne rounded">
              <button
                type="button"
                onClick={() => setCalcOuvert(!calcOuvert)}
                className="w-full text-left text-xs font-mono text-neige/60 px-2 py-1.5 hover:bg-sable/40"
              >
                {calcOuvert ? "▾" : "▸"} Calcul interne (non visible client)
              </button>
              {calcOuvert && (
                <div className="p-2 pt-0 flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex flex-col gap-1">
                      <span className="text-xs text-neige/40">Temps estimé (heures)</span>
                      <input
                        type="number"
                        min="0"
                        step="0.25"
                        value={tempsEstime}
                        onChange={(e) => setTempsEstime(e.target.value)}
                        className="text-sm border border-ligne rounded px-2 py-1"
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs text-neige/40">Taux horaire interne (F CFP/heure)</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={tauxHoraire}
                        onChange={(e) => setTauxHoraire(e.target.value)}
                        className="text-sm border border-ligne rounded px-2 py-1"
                      />
                    </label>
                  </div>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-neige/40">Prix matériaux (F CFP)</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={prixMateriaux}
                      onChange={(e) => setPrixMateriaux(e.target.value)}
                      className="text-sm border border-ligne rounded px-2 py-1"
                    />
                  </label>
                  <div className="text-xs text-neige/50 font-mono">
                    Main d'œuvre : {totalMainOeuvre.toLocaleString("fr-FR")} F CFP · Prix suggéré : {prixSuggere.toLocaleString("fr-FR")} F CFP
                  </div>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-neige/40">Prix final (F CFP)</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={prixFinal}
                      onChange={(e) => {
                        setPrixFinal(e.target.value);
                        setPrixFinalModifie(true);
                      }}
                      className="text-sm border border-ligne rounded px-2 py-1"
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="flex gap-2">
            <button onClick={ajouter} disabled={envoi} className="text-sm bg-rouille text-white rounded px-3 py-1 disabled:opacity-60">
              {envoi ? "..." : "Ajouter"}
            </button>
            <button onClick={() => setOuvert(false)} className="text-sm text-neige/40">
              Annuler
            </button>
          </div>
        </div>
      );
}
            

           
        
        



        
    
