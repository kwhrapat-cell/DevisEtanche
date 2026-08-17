"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { createClient } from "@/lib/supabase/client";
import type { LigneDevis, ProduitEtancheite } from "@/lib/types";
import { prixMoyen } from "@/lib/catalogue";

interface ChantierOption { id: string; nom: string; client_id: string | null; }

function uniteParDefaut(p: ProduitEtancheite): string {
  if (p.unite_consommation) return p.unite_consommation.split("/")[0]; // "L/m2" -> "L", "kg/m2" -> "kg"
  if (p.surface_couverte_m2 != null) return "rouleau";
  return "u.";
}

export default function NouveauDevisPage() {
  const [chantiersList, setChantiersList] = useState<ChantierOption[]>([]);
  const [chantierId, setChantierId] = useState("");
  const [catalogue, setCatalogue] = useState<ProduitEtancheite[]>([]);
  const [produitChoisi, setProduitChoisi] = useState("");
  const [lignes, setLignes] = useState<LigneDevis[]>(() => {
    if (typeof window !== "undefined") {
      const stocke = sessionStorage.getItem("devisetanche.lignes_calcul");
      if (stocke) {
        sessionStorage.removeItem("devisetanche.lignes_calcul");
        try {
          const lignesCalcul = JSON.parse(stocke);
          if (Array.isArray(lignesCalcul) && lignesCalcul.length > 0) return lignesCalcul;
        } catch {
          // ignore et retombe sur la ligne par défaut
        }
      }
    }
    return [{ designation: "Membrane bitumineuse", quantite: 0, unite: "m²", prix_unitaire: 15.5 }];
  });
  const [tva, setTva] = useState(11);
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from("profiles").select("entreprise_id").eq("id", userData.user?.id).single();
      if (!profile) return;
      const { data } = await supabase.from("chantiers").select("id, nom, client_id").eq("entreprise_id", profile.entreprise_id).order("nom");
      setChantiersList(data ?? []);
    })();
    (async () => {
      const { data } = await supabase.from("produits_etancheite").select("*").order("fabricant").order("nom");
      setCatalogue((data ?? []) as ProduitEtancheite[]);
    })();
  }, []);

  const totalHt = useMemo(() => lignes.reduce((s, l) => s + l.quantite * l.prix_unitaire, 0), [lignes]);
  const totalTtc = useMemo(() => totalHt * (1 + tva / 100), [totalHt, tva]);

  function majLigne(i: number, champ: keyof LigneDevis, valeur: string | number) {
    setLignes((prev) => prev.map((l, idx) => (idx === i ? { ...l, [champ]: valeur } : l)));
  }
  function ajouterLigne() {
    setLignes((prev) => [...prev, { designation: "", quantite: 0, unite: "m²", prix_unitaire: 0 }]);
  }
  function ajouterLigneCatalogue() {
    const p = catalogue.find((c) => c.id === produitChoisi);
    if (!p) return;
    setLignes((prev) => [
      ...prev,
      {
        designation: `${p.fabricant} — ${p.nom} (${p.reference})`,
        quantite: 0,
        unite: uniteParDefaut(p),
        prix_unitaire: prixMoyen(p) ?? 0,
      },
    ]);
  }
  function retirerLigne(i: number) {
    setLignes((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    if (!chantierId) {
      setErreur("Sélectionnez un chantier.");
      return;
    }
    setChargement(true);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from("profiles").select("entreprise_id").eq("id", userData.user?.id).single();
    if (!profile) {
      setChargement(false);
      setErreur("Impossible de déterminer votre entreprise.");
      return;
    }
    const chantier = chantiersList.find((c) => c.id === chantierId);
    const numero = `DEV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    const { error } = await supabase.from("devis").insert({
      entreprise_id: profile.entreprise_id,
      chantier_id: chantierId,
      client_id: chantier?.client_id ?? null,
      numero,
      statut: "brouillon",
      lignes,
      total_ht: Math.round(totalHt * 100) / 100,
      tva_pct: tva,
      total_ttc: Math.round(totalTtc * 100) / 100,
    });

    setChargement(false);
    if (error) {
      setErreur("Le devis n'a pas pu être enregistré.");
      return;
    }
    router.push("/devis");
    router.refresh();
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">
        <TopBar titre="Nouveau devis" sousTitre="Ajoutez les lignes puis enregistrez en brouillon" />
        <div className="p-8 max-w-2xl">
          <form onSubmit={enregistrer} className="card p-6 flex flex-col gap-5">
            {erreur && <div className="text-sm text-[#C64A2C] bg-[#F6E1DE] rounded-lg px-3 py-2">{erreur}</div>}

            <div>
              <label className="text-xs font-mono text-ardoise/60 block mb-1">CHANTIER</label>
              <select required value={chantierId} onChange={(e) => setChantierId(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2">
                <option value="">— Choisir —</option>
                {chantiersList.map((c) => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-ardoise/60 block mb-2">LIGNES DU DEVIS</label>
              <div className="flex flex-col gap-2">
                {lignes.map((l, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      placeholder="Désignation"
                      value={l.designation}
                      onChange={(e) => majLigne(i, "designation", e.target.value)}
                      className="border border-ligne rounded-lg px-2 py-1.5 text-sm flex-1"
                    />
                    <input
                      type="number"
                      placeholder="Qté"
                      value={l.quantite}
                      onChange={(e) => majLigne(i, "quantite", parseFloat(e.target.value) || 0)}
                      className="border border-ligne rounded-lg px-2 py-1.5 text-sm w-20"
                    />
                    <input
                      placeholder="Unité"
                      value={l.unite}
                      onChange={(e) => majLigne(i, "unite", e.target.value)}
                      className="border border-ligne rounded-lg px-2 py-1.5 text-sm w-16"
                    />
                    <input
                      type="number"
                      placeholder="Prix U."
                      value={l.prix_unitaire}
                      onChange={(e) => majLigne(i, "prix_unitaire", parseFloat(e.target.value) || 0)}
                      className="border border-ligne rounded-lg px-2 py-1.5 text-sm w-24"
                    />
                    <button type="button" onClick={() => retirerLigne(i)} className="text-ardoise/40 hover:text-[#C64A2C] px-1">✕</button>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <button type="button" onClick={ajouterLigne} className="text-sm text-rouille font-medium">+ Ajouter une ligne</button>
                {catalogue.length > 0 && (
                  <div className="flex items-center gap-2 ml-auto">
                    <select
                      value={produitChoisi}
                      onChange={(e) => setProduitChoisi(e.target.value)}
                      className="border border-ligne rounded-lg px-2 py-1.5 text-sm max-w-[220px]"
                    >
                      <option value="">Depuis le catalogue…</option>
                      {catalogue.map((p) => (
                        <option key={p.id} value={p.id}>{p.fabricant} — {p.nom}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={ajouterLigneCatalogue}
                      disabled={!produitChoisi}
                      className="text-sm text-rouille font-medium disabled:opacity-40"
                    >
                      + Ajouter
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-mono text-ardoise/60">TVA (%)</label>
              <input type="number" value={tva} onChange={(e) => setTva(parseFloat(e.target.value) || 0)} className="border border-ligne rounded-lg px-2 py-1.5 text-sm w-20" />
            </div>

            <div className="bg-ardoise text-white rounded-xl p-4 flex justify-between items-center">
              <div>
                <div className="text-xs text-white/50">Total HT {totalHt.toFixed(2)} € · TVA {tva}%</div>
                <div className="font-mono text-xl font-semibold">{totalTtc.toFixed(2)} € TTC</div>
              </div>
              <button disabled={chargement} className="bg-rouille text-white font-semibold rounded-lg px-5 py-2.5 disabled:opacity-60">
                {chargement ? "Enregistrement…" : "Enregistrer le devis"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
