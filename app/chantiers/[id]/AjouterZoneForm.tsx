"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { queueAction } from "@/lib/offline/queue";

export default function AjouterZoneForm({ chantierId }: { chantierId: string }) {
  const [ouvert, setOuvert] = useState(false);
  const [nom, setNom] = useState("");
  const [surface, setSurface] = useState(0);
  const [chargement, setChargement] = useState(false);
  const [messageHorsLigne, setMessageHorsLigne] = useState(false);
  const router = useRouter();

  async function ajouter(e: React.FormEvent) {
    e.preventDefault();
    setChargement(true);
    const donnees = { chantier_id: chantierId, nom, surface_m2: surface, statut: "en_attente", avancement_pct: 0 };

    if (!navigator.onLine) {
      queueAction("zones", donnees);
      setChargement(false);
      setMessageHorsLigne(true);
      setNom("");
      setSurface(0);
      setOuvert(false);
      return;
    }

    const supabase = createClient();
    await supabase.from("zones").insert(donnees);
    setChargement(false);
    setNom("");
    setSurface(0);
    setOuvert(false);
    router.refresh();
  }

  if (messageHorsLigne) {
    return <p className="text-sm text-ambre">Zone enregistrée hors connexion — elle sera synchronisée automatiquement au retour du réseau.</p>;
  }

  if (!ouvert) {
    return (
      <button onClick={() => setOuvert(true)} className="text-sm text-rouille font-medium">
        + Ajouter une zone
      </button>
    );
  }

  return (
    <form onSubmit={ajouter} className="flex items-end gap-3 flex-wrap">
      <div>
        <label className="text-xs font-mono text-neige/60 block mb-1">NOM DE LA ZONE</label>
        <input required value={nom} onChange={(e) => setNom(e.target.value)} className="border border-ligne rounded-lg px-3 py-2 w-40" />
      </div>
      <div>
        <label className="text-xs font-mono text-neige/60 block mb-1">SURFACE (M²)</label>
        <input type="number" value={surface} onChange={(e) => setSurface(parseFloat(e.target.value) || 0)} className="border border-ligne rounded-lg px-3 py-2 w-28" />
      </div>
      <button disabled={chargement} className="bg-rouille text-white text-sm font-semibold rounded-lg px-4 py-2 disabled:opacity-60">
        {chargement ? "…" : "Ajouter"}
      </button>
    </form>
  );
}
