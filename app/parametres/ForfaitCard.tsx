"use client";

import { useState } from "react";

export default function ForfaitCard({
  id,
  nom,
  prix,
  actuel,
  recommande,
}: {
  id: string;
  nom: string;
  prix: string;
  actuel: boolean;
  recommande?: boolean;
}) {
  const [chargement, setChargement] = useState(false);

  async function choisir() {
    if (id === "decouverte" || id === "entreprise") return; // pas de paiement en ligne pour ces deux-là
    setChargement(true);
    const reponse = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ forfait: id }),
    });
    const data = await reponse.json();
    setChargement(false);
    if (data.url) window.location.href = data.url;
  }

  return (
    <div className={`card p-4 flex flex-col ${recommande ? "border-rouille border-2" : ""}`}>
      <div className="font-medium text-neige text-sm">{nom}</div>
      <div className="font-mono text-lg text-neige mt-1 mb-3">{prix}</div>
      {actuel ? (
        <span className="text-xs text-vert font-mono mt-auto">Forfait actuel</span>
      ) : (
        <button
          onClick={choisir}
          disabled={chargement}
          className="mt-auto text-xs bg-ardoise text-white rounded-lg py-2 disabled:opacity-60"
        >
          {chargement ? "…" : id === "entreprise" ? "Nous contacter" : "Choisir"}
        </button>
      )}
    </div>
  );
}
