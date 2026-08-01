"use client";

import { useState } from "react";

export default function LienClientButton({ token }: { token: string }) {
  const [copie, setCopie] = useState(false);

  function copier() {
    const url = `${window.location.origin}/espace-client/${token}`;
    navigator.clipboard.writeText(url);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  }

  return (
    <button onClick={copier} className="w-full text-xs bg-ardoise/5 text-ardoise rounded-lg py-2 mt-2 hover:bg-ardoise/10">
      {copie ? "Lien copié ✓" : "Copier le lien de suivi client"}
    </button>
  );
}
