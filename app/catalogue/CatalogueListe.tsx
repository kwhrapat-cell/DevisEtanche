"use client";

import { useMemo, useState } from "react";
import type { ProduitEtancheite } from "@/lib/types";
import { GAMME_LABELS, POSE_LABELS, USAGE_LABELS } from "@/lib/catalogue";

export default function CatalogueListe({ produits }: { produits: ProduitEtancheite[] }) {
  const [fabricant, setFabricant] = useState("tous");
  const [gamme, setGamme] = useState("toutes");
  const [recherche, setRecherche] = useState("");

  const fabricants = useMemo(() => Array.from(new Set(produits.map((p) => p.fabricant))).sort(), [produits]);
  const gammes = useMemo(() => Array.from(new Set(produits.map((p) => p.gamme))).sort(), [produits]);

  const filtres = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return produits.filter((p) => {
      if (fabricant !== "tous" && p.fabricant !== fabricant) return false;
      if (gamme !== "toutes" && p.gamme !== gamme) return false;
      if (q && !`${p.nom} ${p.reference}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [produits, fabricant, gamme, recherche]);

  return (
    <div className="flex flex-col gap-5">
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <input
          placeholder="Rechercher un produit ou une référence…"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="flex-1 border border-ligne rounded-lg px-3 py-2 text-sm"
        />
        <select value={fabricant} onChange={(e) => setFabricant(e.target.value)} className="border border-ligne rounded-lg px-3 py-2 text-sm">
          <option value="tous">Tous les fabricants</option>
          {fabricants.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        <select value={gamme} onChange={(e) => setGamme(e.target.value)} className="border border-ligne rounded-lg px-3 py-2 text-sm">
          <option value="toutes">Toutes les gammes</option>
          {gammes.map((g) => (
            <option key={g} value={g}>{GAMME_LABELS[g]}</option>
          ))}
        </select>
      </div>

      {filtres.length === 0 ? (
        <div className="card p-8 text-center text-sm text-neige/50">Aucun produit ne correspond à ces filtres.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtres.map((p) => (
            <ProduitCard key={p.id} produit={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProduitCard({ produit: p }: { produit: ProduitEtancheite }) {
  const prix =
    p.prix_indicatif_min_eur != null || p.prix_indicatif_max_eur != null
      ? `${p.prix_indicatif_min_eur ?? p.prix_indicatif_max_eur}${p.prix_indicatif_max_eur != null && p.prix_indicatif_min_eur != null ? ` – ${p.prix_indicatif_max_eur}` : ""} € ${p.prix_indicatif_conditionnement ?? ""}`
      : null;
  const conso =
    p.consommation_min != null || p.consommation_max != null
      ? `${p.consommation_min ?? ""}${p.consommation_min != null && p.consommation_max != null ? " – " : ""}${p.consommation_max ?? ""} ${p.unite_consommation ?? ""}`
      : null;

  return (
    <div className="card p-5 flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs font-mono text-neige/40">{p.fabricant}</div>
          <div className="font-display font-semibold text-neige leading-snug">{p.nom}</div>
        </div>
        <span className="badge bg-sable text-neige/60 shrink-0">{p.reference}</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="badge bg-[#241E42] text-[#B9A9F5]">{GAMME_LABELS[p.gamme]}</span>
        <span className="badge bg-[#3A2113] text-[#FFAD7A]">{USAGE_LABELS[p.usage_type]}</span>
        <span className="badge bg-[#123024] text-[#6EE7A0]">{POSE_LABELS[p.pose]}</span>
      </div>

      {p.usage_recommande && <p className="text-sm text-neige/70 leading-relaxed">{p.usage_recommande}</p>}

      <div className="text-xs text-neige/50 flex flex-col gap-1 mt-1 pt-2.5 border-t border-ligne font-mono">
        {p.conditionnement && <div>Conditionnement : {p.conditionnement}</div>}
        {p.surface_couverte_m2 != null && <div>Surface couverte : {p.surface_couverte_m2} m²/unité</div>}
        {p.poids_kg != null && <div>Poids : {p.poids_kg} kg</div>}
        {conso && <div>Consommation : {conso}</div>}
        <div>Prix indicatif : {prix ?? "non renseigné"}</div>
      </div>
    </div>
  );
}
