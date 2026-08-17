"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import { calculerEtancheite, type Systeme } from "@/lib/calc/etancheite";
import { createClient } from "@/lib/supabase/client";
import type { ProduitEtancheite } from "@/lib/types";
import { GAMME_PAR_SYSTEME, prixMoyen } from "@/lib/catalogue";

export default function CalculateurPage() {
  const router = useRouter();
  const [surface, setSurface] = useState(680);
  const [perimetre, setPerimetre] = useState<number | undefined>(undefined);
  const [systeme, setSysteme] = useState<Systeme>("bicouche");
  const [isolation, setIsolation] = useState(true);
  const [epaisseurIsolant, setEpaisseurIsolant] = useState(100);
  const [protectionLourde, setProtectionLourde] = useState(false);
  const [catalogue, setCatalogue] = useState<ProduitEtancheite[]>([]);
  const [fabricant, setFabricant] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("produits_etancheite")
      .select("*")
      .then(({ data }) => setCatalogue((data ?? []) as ProduitEtancheite[]));
  }, []);

  const fabricantsDisponibles = useMemo(() => {
    const gammeCible = GAMME_PAR_SYSTEME[systeme];
    return Array.from(new Set<string>(catalogue.filter((p) => p.gamme === gammeCible).map((p) => p.fabricant))).sort();
  }, [catalogue, systeme]);

  useEffect(() => {
    if (fabricantsDisponibles.length === 0) {
      setFabricant("");
    } else if (!fabricantsDisponibles.includes(fabricant)) {
      setFabricant(fabricantsDisponibles[0]);
    }
  }, [fabricantsDisponibles, fabricant]);

  const resultat = useMemo(
    () =>
      calculerEtancheite({
        surface,
        perimetre,
        systeme,
        isolation,
        epaisseurIsolant,
        protectionLourde,
      }),
    [surface, perimetre, systeme, isolation, epaisseurIsolant, protectionLourde]
  );

  function genererDevis() {
    const gammeCible = GAMME_PAR_SYSTEME[systeme];
    const usageMembrane = systeme === "resine" ? "resine_liquide" : "finition";
    const produitMembrane = catalogue.find(
      (p) => p.fabricant === fabricant && p.gamme === gammeCible && p.usage_type === usageMembrane
    );
    const produitPrimaire = catalogue.find((p) => p.fabricant === fabricant && p.usage_type === "primaire");

    const designationMembrane = produitMembrane
      ? `${produitMembrane.fabricant} — ${produitMembrane.nom} (${produitMembrane.reference})`
      : `${resultat.detailsSysteme.nom} — membrane/résine`;
    const designationPrimaire = produitPrimaire
      ? `${produitPrimaire.fabricant} — ${produitPrimaire.nom} (${produitPrimaire.reference})`
      : "Primaire d'accrochage";

    const lignes = [
      { designation: designationMembrane, quantite: resultat.surfaceMembrane, unite: "m²", prix_unitaire: (produitMembrane && prixMoyen(produitMembrane)) ?? 15.5 },
      { designation: "Relevés d'étanchéité", quantite: resultat.surfaceReleves, unite: "m²", prix_unitaire: 22 },
      { designation: designationPrimaire, quantite: resultat.primaireAccrochage, unite: "L", prix_unitaire: (produitPrimaire && prixMoyen(produitPrimaire)) ?? 8.5 },
      { designation: "Évacuations eaux pluviales", quantite: resultat.evacuationsEP, unite: "u.", prix_unitaire: 65 },
      ...(resultat.fixationsMecaniques > 0
        ? [{ designation: "Fixations mécaniques", quantite: resultat.fixationsMecaniques, unite: "u.", prix_unitaire: 0.8 }]
        : []),
      ...(isolation
        ? [{ designation: `Isolant thermique ${epaisseurIsolant}mm`, quantite: resultat.isolantSurface, unite: "m²", prix_unitaire: 12.8 }]
        : []),
      ...(protectionLourde
        ? [{ designation: "Protection gravillon", quantite: resultat.protectionGravillon / 50, unite: "sacs 50kg", prix_unitaire: 6 }]
        : []),
    ];
    sessionStorage.setItem("devisetanche.lignes_calcul", JSON.stringify(lignes));
    router.push("/devis/nouveau?depuis=calcul");
  }

  return (
    <>
        <TopBar titre="Calculateur" sousTitre="Estimation des quantités — à valider selon le DTU applicable au projet" />
        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 flex flex-col gap-4">
            <div>
              <label className="text-xs font-mono text-neige/60 block mb-1">SURFACE DE TOITURE (M²)</label>
              <input
                type="number"
                value={surface}
                onChange={(e) => setSurface(parseFloat(e.target.value) || 0)}
                className="w-full border border-ligne rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-neige/60 block mb-1">
                PÉRIMÈTRE (ML) — laisser vide pour estimation automatique
              </label>
              <input
                type="number"
                placeholder="estimé automatiquement"
                value={perimetre ?? ""}
                onChange={(e) => setPerimetre(e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full border border-ligne rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-neige/60 block mb-1">SYSTÈME D'ÉTANCHÉITÉ</label>
              <select
                value={systeme}
                onChange={(e) => setSysteme(e.target.value as Systeme)}
                className="w-full border border-ligne rounded-lg px-3 py-2"
              >
                <option value="bicouche">Bicouche bitumineuse (DTU 43.1 / 43.4)</option>
                <option value="pvc">Membrane PVC monocouche (DTU 43.3)</option>
                <option value="resine">Résine liquide — SEL (NF DTU 43.6)</option>
              </select>
            </div>

            {fabricantsDisponibles.length > 0 && (
              <div>
                <label className="text-xs font-mono text-neige/60 block mb-1">FABRICANT</label>
                <select
                  value={fabricant}
                  onChange={(e) => setFabricant(e.target.value)}
                  className="w-full border border-ligne rounded-lg px-3 py-2"
                >
                  {fabricantsDisponibles.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <input
                id="isolation"
                type="checkbox"
                checked={isolation}
                onChange={(e) => setIsolation(e.target.checked)}
              />
              <label htmlFor="isolation" className="text-sm">Pose d'un isolant thermique sous étanchéité</label>
            </div>
            {isolation && (
              <div>
                <label className="text-xs font-mono text-neige/60 block mb-1">ÉPAISSEUR ISOLANT (MM)</label>
                <input
                  type="number"
                  value={epaisseurIsolant}
                  onChange={(e) => setEpaisseurIsolant(parseFloat(e.target.value) || 0)}
                  className="w-full border border-ligne rounded-lg px-3 py-2"
                />
              </div>
            )}
            <div className="flex items-center gap-3">
              <input
                id="protection"
                type="checkbox"
                checked={protectionLourde}
                onChange={(e) => setProtectionLourde(e.target.checked)}
              />
              <label htmlFor="protection" className="text-sm">Protection lourde (gravillon)</label>
            </div>
          </div>

          <div className="card p-6 bg-ardoise text-white">
            <div className="text-xs font-mono text-white/50 mb-1">SYSTÈME · {resultat.detailsSysteme.reference}</div>
            <div className="font-display font-semibold mb-5">{resultat.detailsSysteme.nom}</div>
            <div className="grid grid-cols-2 gap-3">
              <Resultat label="Surface membrane / résine" valeur={`${resultat.surfaceMembrane} m²`} />
              <Resultat label="Surface relevés" valeur={`${resultat.surfaceReleves} m²`} />
              <Resultat label="Linéaire relevés" valeur={`${resultat.metresReleves} ml`} />
              <Resultat label="Primaire d'accrochage" valeur={`${resultat.primaireAccrochage} L`} />
              <Resultat label="Évacuations EP" valeur={`${resultat.evacuationsEP} u.`} />
              <Resultat
                label="Fixations mécaniques"
                valeur={resultat.fixationsMecaniques > 0 ? `${resultat.fixationsMecaniques} u.` : "collée / soudée"}
              />
              {isolation && (
                <>
                  <Resultat label="Isolant — surface" valeur={`${resultat.isolantSurface} m²`} />
                  <Resultat label="Isolant — volume" valeur={`${resultat.isolantVolume} m³`} />
                </>
              )}
              {protectionLourde && (
                <Resultat label="Protection gravillon" valeur={`${resultat.protectionGravillon.toLocaleString("fr-FR")} kg`} />
              )}
            </div>
            <p className="text-xs text-white/40 mt-6">
              Estimation de chantier basée sur des ratios usuels ({(resultat.detailsSysteme.pertes * 100).toFixed(0)}%
              de pertes/recouvrement pour ce système). À confirmer par une note de calcul et le DTU applicable au
              support réel avant commande.
            </p>
            <button onClick={genererDevis} className="w-full bg-rouille text-white font-semibold rounded-lg py-2.5 mt-4">
              Générer un devis à partir de ce calcul
            </button>
          </div>
        </div>
    </>
  );
}

function Resultat({ label, valeur }: { label: string; valeur: string }) {
  return (
    <div className="bg-white/10 rounded-lg px-3 py-3">
      <div className="font-mono font-semibold text-rouille-2">{valeur}</div>
      <div className="text-xs text-white/55 mt-1">{label}</div>
    </div>
  );
}
