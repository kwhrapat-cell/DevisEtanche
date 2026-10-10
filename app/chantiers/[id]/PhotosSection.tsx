"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { tenterVidage } from "@/lib/offline/queue";
import { envoyerPhoto, type PhotoChantier as Photo } from "@/lib/photos";
import { Camera, Image } from "@/components/icons";
import { classesBouton } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

export default function PhotosSection({ chantierId, photosInitiales, lectureSeule = false }: { chantierId: string; photosInitiales: Photo[]; lectureSeule?: boolean }) {
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
    <Card className="p-5">
      <CardHeader
        titre="Photos"
        sousTitre={photos.length > 0 ? `${photos.length} photo${photos.length > 1 ? "s" : ""}` : undefined}
        action={
          !lectureSeule && (
            // <label> plutôt que <Button> : c'est lui qui ouvre l'appareil photo.
            <label className={cn(classesBouton({ taille: "lg" }), "cursor-pointer", envoi && "pointer-events-none opacity-50")}>
              <Camera size={20} className="shrink-0" />
              {envoi ? "Envoi…" : "Prendre une photo"}
              <input type="file" accept="image/*" capture="environment" onChange={surSelection} className="hidden" disabled={envoi} />
            </label>
          )
        }
      />
      {erreur && <div className="mb-3 rounded-lg bg-rouge/10 px-3 py-2 text-sm text-rouge">{erreur}</div>}
      {photos.length === 0 ? (
        <EmptyState icone={Image} titre="Aucune photo pour l'instant" texte="Les photos prises sur le chantier apparaîtront ici." />
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-6">
          {photos.map((p) => (
            <a key={p.id} href={p.url} target="_blank" rel="noreferrer">
              <img src={p.url} alt={p.legende ?? "Photo de chantier"} className="aspect-square w-full rounded-lg object-cover" />
            </a>
          ))}
        </div>
      )}
    </Card>
  );
}
