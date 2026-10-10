"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { tenterVidage } from "@/lib/offline/queue";
import { envoyerPhoto, type PhotoChantier as Photo } from "@/lib/photos";

export default function PhotosSection({ chantierId, photosInitiales }: { chantierId: string; photosInitiales: Photo[] }) {
  const [photos, setPhotos] = useState(photosInitiales);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    tenterVidage().then(() => router.refresh());
  }, [router]);

  async function surSelection(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    setErreur(null);
    setEnvoi(true);
    const resultat = await envoyerPhoto(chantierId, fichier);
    setEnvoi(false);
    if ("erreur" in resultat) {
      setErreur(resultat.erreur);
      return;
    }
    setPhotos((prev) => [resultat.photo, ...prev]);
  }

  return (
    <div className="card p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-encre">Photos</h2>
        <label className="text-sm text-primaire font-medium cursor-pointer">
          {envoi ? "Envoi…" : "+ Ajouter une photo"}
          <input type="file" accept="image/*" capture="environment" onChange={surSelection} className="hidden" disabled={envoi} />
        </label>
      </div>
      {erreur && <div className="text-sm text-rouge bg-rouge/10 rounded-lg px-3 py-2 mb-3">{erreur}</div>}
      {photos.length === 0 ? (
        <p className="text-sm text-encre/60">Aucune photo pour l'instant.</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {photos.map((p) => (
            <img key={p.id} src={p.url} alt={p.legende ?? "Photo de chantier"} className="w-full h-24 object-cover rounded-lg" />
          ))}
        </div>
      )}
    </div>
  );
}
