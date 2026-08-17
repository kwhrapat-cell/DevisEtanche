"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NouveauClientForm({ entrepriseId }: { entrepriseId: string | null }) {
  const [nom, setNom] = useState("");
  const [type, setType] = useState<"syndic" | "particulier" | "entreprise">("particulier");
  const [ville, setVille] = useState("");
  const [ouvert, setOuvert] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);
  const router = useRouter();

  async function ajouterClient(e: React.FormEvent) {
    e.preventDefault();
    if (!entrepriseId) {
      setErreur("Session introuvable — reconnectez-vous.");
      return;
    }
    setChargement(true);
    setErreur(null);
    const supabase = createClient();
    const { error } = await supabase.from("clients").insert({ entreprise_id: entrepriseId, nom, type, ville });
    setChargement(false);
    if (error) {
      setErreur("Impossible d'enregistrer ce client.");
      return;
    }
    setNom("");
    setVille("");
    setOuvert(false);
    router.refresh();
  }

  if (!ouvert) {
    return (
      <button onClick={() => setOuvert(true)} className="self-start bg-rouille text-white text-sm font-semibold rounded-lg px-4 py-2.5">
        + Nouveau client
      </button>
    );
  }

  return (
    <form onSubmit={ajouterClient} className="card p-5 flex flex-col sm:flex-row gap-3 items-end">
      {erreur && <div className="text-sm text-[#FF8A80]">{erreur}</div>}
      <div className="flex-1 w-full">
        <label className="text-xs font-mono text-neige/60 block mb-1">NOM</label>
        <input required value={nom} onChange={(e) => setNom(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2" />
      </div>
      <div className="w-full sm:w-40">
        <label className="text-xs font-mono text-neige/60 block mb-1">TYPE</label>
        <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="w-full border border-ligne rounded-lg px-3 py-2">
          <option value="particulier">Particulier</option>
          <option value="syndic">Syndic</option>
          <option value="entreprise">Entreprise</option>
        </select>
      </div>
      <div className="w-full sm:w-40">
        <label className="text-xs font-mono text-neige/60 block mb-1">VILLE</label>
        <input value={ville} onChange={(e) => setVille(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2" />
      </div>
      <button type="submit" disabled={chargement} className="bg-rouille text-white text-sm font-semibold rounded-lg px-4 py-2.5 disabled:opacity-60">
        {chargement ? "…" : "Ajouter"}
      </button>
    </form>
  );
}
