"use client";

import { useEffect, useState } from "react";
import { nombreEnAttente, tenterVidage } from "@/lib/offline/queue";

export default function OfflineBanner() {
  const [horsLigne, setHorsLigne] = useState(false);
  const [enAttente, setEnAttente] = useState(0);

  useEffect(() => {
    setHorsLigne(!navigator.onLine);
    setEnAttente(nombreEnAttente());

    function surEnLigne() {
      setHorsLigne(false);
      tenterVidage().then(() => setEnAttente(nombreEnAttente()));
    }
    function surHorsLigne() {
      setHorsLigne(true);
    }

    window.addEventListener("online", surEnLigne);
    window.addEventListener("offline", surHorsLigne);
    return () => {
      window.removeEventListener("online", surEnLigne);
      window.removeEventListener("offline", surHorsLigne);
    };
  }, []);

  if (!horsLigne && enAttente === 0) return null;

  return (
    <div className={`text-xs text-center py-1.5 font-mono ${horsLigne ? "bg-ambre text-ardoise" : "bg-vert text-white"}`}>
      {horsLigne
        ? "Hors connexion — vos modifications seront synchronisées automatiquement."
        : `Synchronisation de ${enAttente} modification(s) en attente…`}
    </div>
  );
}
