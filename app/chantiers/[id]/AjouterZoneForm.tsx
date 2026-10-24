"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { queueAction } from "@/lib/offline/queue";
import { Plus } from "@/components/icons";
import { Button } from "@/components/ui/Button";

export default function AjouterZoneForm({ chantierId }: { chantierId: string }) {
  const [ouvert, setOuvert] = useState(false);
  const [nom, setNom] = useState("");
  const [surface, setSurface] = useState(0);
  const [chargement, setChargement] = useState(false);
  const [messageHorsLigne, setMessageHorsLigne] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const router = useRouter();

  function garderEnAttente(donnees: Record<string, unknown>) {
    queueAction("zones", donnees);
    setChargement(false);
    setMessageHorsLigne(true);
    setNom("");
    setSurface(0);
    setOuvert(false);
  }

  async function ajouter(e: React.FormEvent) {
    e.preventDefault();
    setChargement(true);
    setErreur(null);
    const donnees = { chantier_id: chantierId, nom, surface_m2: surface, statut: "en_attente", avancement_pct: 0 };

    if (!navigator.onLine) {
      garderEnAttente(donnees);
      return;
    }

    // Signal faible : le téléphone se croit en ligne mais l'envoi échoue. Avant, la zone
    // était alors perdue sans message ; elle est maintenant gardée en attente d'envoi.
    let coupureReseau = false;
    let refusBase = false;
    try {
      const { error } = await createClient().from("zones").insert(donnees);
      if (error) {
        if (/fetch|network/i.test(error.message)) coupureReseau = true;
        else refusBase = true;
      }
    } catch {
      coupureReseau = true;
    }

    if (coupureReseau) {
      garderEnAttente(donnees);
      return;
    }
    if (refusBase) {
      setChargement(false);
      setErreur("La zone n'a pas pu être enregistrée. Réessayez.");
      return;
    }

    setChargement(false);
    setNom("");
    setSurface(0);
    setOuvert(false);
    router.refresh();
  }

  if (messageHorsLigne) {
    return <p className="text-sm text-amber-700">Zone enregistrée hors connexion — elle sera synchronisée automatiquement au retour du réseau.</p>;
  }

  if (!ouvert) {
    return (
      <Button variante="secondaire" icone={Plus} onClick={() => setOuvert(true)}>
        Ajouter une zone
      </Button>
    );
  }

  return (
    <form onSubmit={ajouter} className="flex items-end gap-3 flex-wrap">
      <div>
        <label className="text-xs font-mono text-encre/70 block mb-1">NOM DE LA ZONE</label>
        <input required value={nom} onChange={(e) => setNom(e.target.value)} className="border border-ligne rounded-lg px-3 py-2 w-40" />
      </div>
      <div>
        <label className="text-xs font-mono text-encre/70 block mb-1">SURFACE (M²)</label>
        <input type="number" value={surface} onChange={(e) => setSurface(parseFloat(e.target.value) || 0)} className="border border-ligne rounded-lg px-3 py-2 w-28" />
      </div>
      <button disabled={chargement} className="bg-primaire text-white text-sm font-semibold rounded-lg px-4 py-2 disabled:opacity-60">
        {chargement ? "…" : "Ajouter"}
      </button>
      {erreur && <p className="w-full text-sm text-rouge">{erreur}</p>}
    </form>
  );
}
