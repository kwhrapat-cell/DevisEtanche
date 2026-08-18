"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import { createClient } from "@/lib/supabase/client";
import type { LigneDevis, ProduitEtancheite } from "@/lib/types";
import { prixMoyen } from "@/lib/catalogue";
import { calculerConsommationLiquide, calculerRouleaux, verifierCompatibiliteMarque } from "@/lib/produits-aide";
import { convertirEurVersDevise, formatMontant, type Devise } from "@/lib/devise";

interface ChantierOption { id: string; nom: string; client_id: string | null; }

const FABRICANTS_CONNUS = ["Soprema", "Sika", "Axter"];

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
  const [surfaceVisee, setSurfaceVisee] = useState(0);
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
    return [{ designation: "Membrane bitumineuse", quantite: 0, unite: "m²", prix_unitaire: 0 }];
  });
  const [tva, setTva] = useState(11);
  const [devise, setDevise] = useState<Devise>("XPF");
  const [libelleTaxe, setLibelleTaxe] = useState("TGC");
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
      const { data: entreprise } = await supabase
        .from("entreprises")
        .select("devise, libelle_taxe, taux_taxe_defaut")
        .eq("id", profile.entreprise_id)
        .single();
      if (entreprise) {
        setDevise(entreprise.devise);
        setLibelleTaxe(entreprise.libelle_taxe);
        setTva(entreprise.taux_taxe_defaut);
      }
    })();
    (async () => {
      const { data } = await supabase.from("produits_etancheite").select("*").order("fabricant").order("nom");
      setCatalogue((data ?? []) as ProduitEtancheite[]);
    })();
  }, []);

  const totalHt = useMemo(() => lignes.reduce((s, l) => s + l.quantite * l.prix_unitaire, 0), [lignes]);
  const totalTtc = useMemo(() => totalHt * (1 + tva / 100), [totalHt, tva]);

  const marquesUtilisees = useMemo(
    () => lignes.map((l) => l.designation.split(" — ")[0]).filter((f) => FABRICANTS_CONNUS.includes(f)),
    [lignes]
  );
  const compatibilite = useMemo(() => verifierCompatibiliteMarque(marquesUtilisees), [marquesUtilisees]);

  function majLigne(i: number, champ: keyof LigneDevis, valeur: string | number) {
    setLignes((prev) => prev.map((l, idx) => (idx === i ? { ...l, [champ]: valeur } : l)));
  }
  function ajouterLigne() {
    setLignes((prev) => [...prev, { designation: "", quantite: 0, unite: "m²", prix_unitaire: 0 }]);
  }
  function ajouterLigneCatalogue() {
    const p = catalogue.find((c) => c.id === produitChoisi);
    if (!p) return;
    let quantite = 0;
    let unite = uniteParDefaut(p);
    if (surfaceVisee > 0) {
      if (p.surface_couverte_m2) {
        quantite = calculerRouleaux(surfaceVisee, p);
        unite = "rouleau";
      } else if (p.consommation_min != null || p.consommation_max != null) {
        quantite = calculerConsommationLiquide(surfaceVisee, p);
      } else {
        quantite = surfaceVisee;
      }
    }
    const prixEur = prixMoyen(p);
    setLignes((prev) => [
      ...prev,
      {
        designation: `${p.fabricant} — ${p.nom} (${p.reference})`,
        quantite,
        unite,
        prix_unitaire: prixEur != null ? convertirEurVersDevise(prixEur, devise) : 0,
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
    <>
        <TopBar titre="Nouveau devis" sousTitre="Ajoutez les lignes puis enregistrez en brouillon" />
        <div className="p-4 sm:p-8 max-w-2xl">
          <form onSubmit={enregistrer} className="card p-6 flex flex-col gap-5">
            {erreur && <div className="text-sm text-[#FF8A80] bg-[#3B1418] rounded-lg px-3 py-2">{erreur}</div>}

            <div>
              <label className="text-xs font-mono text-neige/60 block mb-1">CHANTIER</label>
              <select required value={chantierId} onChange={(e) => setChantierId(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2">
                <option value="">— Choisir —</option>
                {chantiersList.map((c) => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-neige/60 block mb-2">LIGNES DU DEVIS</label>
              <div className="flex flex-col gap-2">
                {lignes.map((l, i) => (
                  <div key={i} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="flex gap-2 items-center sm:contents">
                      <input
                        placeholder="Désignation"
                        value={l.designation}
                        onChange={(e) => majLigne(i, "designation", e.target.value)}
                        className="border border-ligne rounded-lg px-2 py-1.5 text-sm flex-1 min-w-0 sm:flex-1"
                      />
                      <button type="button" onClick={() => retirerLigne(i)} className="text-neige/40 hover:text-[#FF8A80] px-1 shrink-0 sm:order-last">✕</button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:contents">
                      <input
                        type="number"
                        placeholder="Qté"
                        value={l.quantite}
                        onChange={(e) => majLigne(i, "quantite", parseFloat(e.target.value) || 0)}
                        className="border border-ligne rounded-lg px-2 py-1.5 text-sm w-full sm:w-20"
                      />
                      <input
                        placeholder="Unité"
                        value={l.unite}
                        onChange={(e) => majLigne(i, "unite", e.target.value)}
                        className="border border-ligne rounded-lg px-2 py-1.5 text-sm w-full sm:w-16"
                      />
                      <input
                        type="number"
                        placeholder="Prix U."
                        value={l.prix_unitaire}
                        onChange={(e) => majLigne(i, "prix_unitaire", parseFloat(e.target.value) || 0)}
                        className="border border-ligne rounded-lg px-2 py-1.5 text-sm w-full sm:w-24"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <button type="button" onClick={ajouterLigne} className="text-sm text-rouille font-medium">+ Ajouter une ligne</button>
                {catalogue.length > 0 && (
                  <div className="flex items-center gap-2 ml-auto">
                    <input
                      type="number"
                      min={0}
                      placeholder="Surface m²"
                      title="Surface visée — calcule automatiquement le nombre de rouleaux ou la consommation"
                      value={surfaceVisee || ""}
                      onChange={(e) => setSurfaceVisee(parseFloat(e.target.value) || 0)}
                      className="border border-ligne rounded-lg px-2 py-1.5 text-sm w-24"
                    />
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
              {!compatibilite.compatible && (
                <div className="text-xs text-[#FF8A80] bg-[#3B1418] rounded-lg px-3 py-2 mt-3">
                  {compatibilite.message}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-mono text-neige/60">{libelleTaxe} (%)</label>
              <input type="number" value={tva} onChange={(e) => setTva(parseFloat(e.target.value) || 0)} className="border border-ligne rounded-lg px-2 py-1.5 text-sm w-20" />
            </div>

            <div className="bg-ardoise text-white rounded-xl p-4 flex justify-between items-center">
              <div>
                <div className="text-xs text-white/50">Total HT {formatMontant(totalHt, devise)} · {libelleTaxe} {tva}%</div>
                <div className="font-mono text-xl font-semibold">{formatMontant(totalTtc, devise)} TTC</div>
              </div>
              <button disabled={chargement} className="bg-rouille text-white font-semibold rounded-lg px-5 py-2.5 disabled:opacity-60">
                {chargement ? "Enregistrement…" : "Enregistrer le devis"}
              </button>
            </div>
          </form>
        </div>
    </>
  );
}
