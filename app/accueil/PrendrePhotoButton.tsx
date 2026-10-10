"use client";

import { useRef, useState } from "react";
import { Camera } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { envoyerPhoto } from "@/lib/photos";

/**
 * Gros bouton « Prendre une photo » : ouvre directement l'appareil photo du
 * téléphone et rattache la photo au chantier du jour, sans passer par sa fiche.
 */
export default function PrendrePhotoButton({ chantierId, chantierNom }: { chantierId: string | null; chantierNom: string | null }) {
  const champFichier = useRef<HTMLInputElement>(null);
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; texte: string } | null>(null);

  async function surSelection(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    e.target.value = ""; // permet de reprendre une photo juste après
    if (!fichier || !chantierId) return;
    setMessage(null);
    setEnvoi(true);
    const resultat = await envoyerPhoto(chantierId, fichier);
    setEnvoi(false);
    setMessage("erreur" in resultat ? { ok: false, texte: resultat.erreur } : { ok: true, texte: `Photo ajoutée à « ${chantierNom} ».` });
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        taille="lg"
        variante="secondaire"
        pleineLargeur
        icone={Camera}
        disabled={!chantierId || envoi}
        onClick={() => champFichier.current?.click()}
      >
        {envoi ? "Envoi de la photo…" : "Prendre une photo"}
      </Button>
      <input ref={champFichier} type="file" accept="image/*" capture="environment" onChange={surSelection} className="hidden" />
      {!chantierId && <p className="text-xs text-encre/60">Aucun chantier en cours pour y ranger la photo.</p>}
      {message && (
        <p role="status" className={message.ok ? "rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700" : "rounded-lg bg-rouge/10 px-3 py-2 text-sm text-rouge"}>
          {message.texte}
        </p>
      )}
    </div>
  );
}
