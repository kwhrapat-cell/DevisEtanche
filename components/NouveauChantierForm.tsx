"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Props {
  entrepriseId: string | null;
  clients: { id: string; nom: string }[];
}

export default function NouveauChantierForm({ entrepriseId, clients }: Props) {
  const [nom, setNom] = useState("");
  const [ville, setVille] = useState("");
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [surface, setSurface] = useState(0);
  const [systeme, setSysteme] = useState<"bicouche" | "pvc" | "resine">("bicouche");
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);
  const router = useRouter();

  async function creerChantier(e: React.FormEvent) {
    e.preventDefault();
    if (!entrepriseId) {
      setErreur("Session introuvable — reconnectez-vous.");
      return;
    }
    setChargement(true);
    setErreur(null);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("chantiers")
      .insert({
        entreprise_id: entrepriseId,
        client_id: clientId || null,
        nom,
        ville,
        statut: "en_preparation",
        surface_totale_m2: surface,
        avancement_pct: 0,
        systeme,
        date_debut: new Date().toISOString().slice(0, 10),
      })
      .select()
      .single();

    setChargement(false);
    if (error || !data) {
      setErreur("Impossible de créer ce chantier.");
      return;
    }
    router.push(`/chantiers/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={creerChantier} className="card p-6 flex flex-col gap-4">
      {erreur && <div className="text-sm text-[#FF8A80] bg-[#3B1418] rounded-lg px-3 py-2">{erreur}</div>}
      {clients.length === 0 && (
        <div className="text-sm text-neige/60 bg-sable rounded-lg px-3 py-2">
          Aucun client enregistré — vous pourrez en associer un plus tard depuis la page Clients.
        </div>
      )}

      <div>
        <label className="text-xs font-mono text-neige/60 block mb-1">NOM DU CHANTIER</label>
        <input required value={nom} onChange={(e) => setNom(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2" />
      </div>
      <div>
        <label className="text-xs font-mono text-neige/60 block mb-1">VILLE</label>
        <input value={ville} onChange={(e) => setVille(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2" />
      </div>
      {clients.length > 0 && (
        <div>
          <label className="text-xs font-mono text-neige/60 block mb-1">CLIENT</label>
          <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2">
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="text-xs font-mono text-neige/60 block mb-1">SURFACE TOTALE (M²)</label>
        <input
          type="number"
          min={0}
          value={surface}
          onChange={(e) => setSurface(parseFloat(e.target.value) || 0)}
          className="w-full border border-ligne rounded-lg px-3 py-2"
        />
      </div>
      <div>
        <label className="text-xs font-mono text-neige/60 block mb-1">SYSTÈME D'ÉTANCHÉITÉ</label>
        <select value={systeme} onChange={(e) => setSysteme(e.target.value as typeof systeme)} className="w-full border border-ligne rounded-lg px-3 py-2">
          <option value="bicouche">Bicouche bitumineuse</option>
          <option value="pvc">Membrane PVC monocouche</option>
          <option value="resine">Résine liquide (SEL)</option>
        </select>
      </div>

      <button type="submit" disabled={chargement} className="bg-rouille text-white font-semibold rounded-lg py-2.5 disabled:opacity-60">
        {chargement ? "Création…" : "Créer le chantier"}
      </button>
    </form>
  );
}
