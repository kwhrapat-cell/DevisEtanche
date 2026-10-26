"use client";

import { useState } from "react";

/**
 * Carte de forfait dans Paramètres. Paiement en ligne (Lemon Squeezy) seulement s'il est
 * configuré (`paiementEnLigne`) et pour Artisan ou Pro ; sinon le bouton ouvre un e-mail prérempli.
 */
export default function ForfaitCard({
  id,
  nom,
  prix,
  actuel,
  recommande,
  paiementEnLigne,
  emailContact,
}: {
  id: string;
  nom: string;
  prix: string;
  actuel: boolean;
  recommande?: boolean;
  paiementEnLigne: boolean;
  emailContact: string;
}) {
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const lienContact = `mailto:${emailContact}?subject=${encodeURIComponent(`Forfait ${nom} — DevisEtanche`)}`;
  const parPaiementEnLigne = paiementEnLigne && (id === "artisan" || id === "pro");

  async function payer() {
    setChargement(true);
    setErreur(null);
    try {
      const reponse = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forfait: id }),
      });
      const data = await reponse.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setErreur(data.message ?? "Le paiement en ligne n'a pas pu démarrer. Écrivez-nous pour changer de forfait.");
    } catch {
      setErreur("Le paiement en ligne n'a pas pu démarrer. Écrivez-nous pour changer de forfait.");
    }
    setChargement(false);
  }

  const classesAction = "mt-auto flex min-h-[44px] items-center justify-center text-xs bg-marine text-white rounded-lg py-2 disabled:opacity-60";

  return (
    <div className={`card p-4 flex flex-col ${recommande ? "border-primaire border-2" : ""}`}>
      <div className="font-medium text-encre text-sm">{nom}</div>
      <div className="font-mono text-lg text-encre mt-1 mb-3">{prix}</div>
      {actuel ? (
        <span className="text-xs text-emerald-700 font-mono mt-auto">Forfait actuel</span>
      ) : parPaiementEnLigne ? (
        <button onClick={payer} disabled={chargement} className={classesAction}>
          {chargement ? "…" : "Choisir"}
        </button>
      ) : (
        <a href={lienContact} className={classesAction}>
          Nous contacter
        </a>
      )}
      {erreur && (
        <p className="mt-2 text-xs text-rouge">
          {erreur}{" "}
          <a href={lienContact} className="underline">
            {emailContact}
          </a>
        </p>
      )}
    </div>
  );
}
