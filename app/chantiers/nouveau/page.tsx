"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { createClient } from "@/lib/supabase/client";
import type { Systeme } from "@/lib/calc/etancheite";

interface ClientOption { id: string; nom: string; }

export default function NouveauChantierPage() {
  const [clientsList, setClientsList] = useState<ClientOption[]>([]);
  const [nom, setNom] = useState("");
  const [ville, setVille] = useState("");
  const [clientId, setClientId] = useState("");
  const [surface, setSurface] = useState(0);
  const [systeme, setSysteme] = useState<Systeme>("bicouche");
  const [dateDebut, setDateDebut] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from("profiles").select("entreprise_id").eq("id", userData.user?.id).single();
      if (!profile) return;
      const { data } = await supabase.from("clients").select("id, nom").eq("entreprise_id", profile.entreprise_id).order("nom");
      setClientsList(data ?? []);
    })();
  }, []);

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setChargement(true);
    const supabase = createClient();

    const { data: userData } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from("profiles").select("entreprise_id").eq("id", userData.user?.id).single();
    if (!profile) {
      setChargement(false);
      setErreur("Impossible de déterminer votre entreprise.");
      return;
    }

    const { data: chantier, error } = await supabase
      .from("chantiers")
      .insert({
        entreprise_id: profile.entreprise_id,
        client_id: clientId || null,
        nom,
        ville,
        statut: "en_preparation",
        surface_totale_m2: surface,
        avancement_pct: 0,
        systeme,
        date_debut: dateDebut || null,
      })
      .select()
      .single();

    setChargement(false);
    if (error || !chantier) {
      setErreur("Le chantier n'a pas pu être créé.");
      return;
    }
    router.push(`/chantiers/${chantier.id}`);
    router.refresh();
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">
        <TopBar titre="Nouveau chantier" sousTitre="Renseignez les informations essentielles" />
        <div className="p-8 max-w-lg">
          <form onSubmit={enregistrer} className="card p-6 flex flex-col gap-4">
            {erreur && <div className="text-sm text-[#FF8A80] bg-[#3B1418] rounded-lg px-3 py-2">{erreur}</div>}

            <div>
              <label className="text-xs font-mono text-neige/60 block mb-1">NOM DU CHANTIER</label>
              <input required value={nom} onChange={(e) => setNom(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="text-xs font-mono text-neige/60 block mb-1">VILLE</label>
              <input value={ville} onChange={(e) => setVille(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="text-xs font-mono text-neige/60 block mb-1">CLIENT (MAÎTRE D'OUVRAGE)</label>
              <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2">
                <option value="">— Aucun pour l'instant —</option>
                {clientsList.map((c) => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
              {clientsList.length === 0 && (
                <p className="text-xs text-neige/40 mt-1">Aucun client enregistré — vous pourrez en associer un plus tard.</p>
              )}
            </div>
            <div>
              <label className="text-xs font-mono text-neige/60 block mb-1">SURFACE TOTALE (M²)</label>
              <input type="number" value={surface} onChange={(e) => setSurface(parseFloat(e.target.value) || 0)} className="w-full border border-ligne rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="text-xs font-mono text-neige/60 block mb-1">SYSTÈME D'ÉTANCHÉITÉ</label>
              <select value={systeme} onChange={(e) => setSysteme(e.target.value as Systeme)} className="w-full border border-ligne rounded-lg px-3 py-2">
                <option value="bicouche">Bicouche bitumineuse</option>
                <option value="pvc">Membrane PVC monocouche</option>
                <option value="resine">Résine liquide (SEL)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-mono text-neige/60 block mb-1">DATE DE DÉBUT</label>
              <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2" />
            </div>
            <button disabled={chargement} className="bg-rouille text-white font-semibold rounded-lg py-2.5 disabled:opacity-60">
              {chargement ? "Création…" : "Créer le chantier"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
