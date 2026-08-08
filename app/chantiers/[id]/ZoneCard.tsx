"use client";

import { useState } from "react";
import AjouterElementForm from "./AjouterElementForm";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const couleurStatut: Record<string, string> = {
  termine: "bg-vert",
  en_cours: "bg-ambre",
  en_attente: "bg-ardoise/20",
  probleme: "bg[#C64A2C]",
};

const labelStatut: Record<string, string> = {
  en_attente: "En attente",
  en_cours: "En cours",
  termine: "Terminé",
  probleme: "Problème",
};

const ordreStatuts = ["en_attente", "en_cours", "termine", "probleme"];

export default function ZoneCard({ zone }: {zone: any }) {
  const [ouvert, setOuvert] =useState(false);
  const [statut, setStatut] =useState(zone.statut);
  const router = useRouter();

  async function changerStatut(nouveau: string) {
    setOuvert(false);

    if (!navigator.onLine) {
      alert("connexion nécessaire pour changer le statut.");
      return;
    }

    setStatut(nouveau);
    const supabase = createClient();
    await supabase.from("zones").update({ statut: nouveau }).eq("id", zone.id);
    router.refresh();
  }

  return (
    <div className="relative">
      <button
      onClick={() => setOuvert(!ouvert)}
      className={`rounded-x1 p-4 text-white flex flex-col justify-end h-32 w-full text-left ${couleurStatut[statut]}`}
    >
      <div className="font-medium text-sm">{zone.nom}</div>
      <div className="font-mono text-xs opacity-80">
       {zone.avancement_pct}% . {zone.surface_m2} m²
     </div>
   </button>

   {ouvert && (
    <div className="absolute z-10 top-full left-0 mt-1 w-full bg-white rounded-lg shadow-lg border border-ligne overflow-hidden">
    {ordreStatuts.map((s) => (
      <button
        key={s}
        onClick={() => changerStatut(s)}
        className="block w-full text-left px-3 py-2 text-sm text-ardoise hover:bg-sable/40"
      >

        {labelStatut[s]}
      </button>
    ))}
    <AjouterElementForm zoneId={zone.id} />
  </div>
  )}
  </div>
  );
}