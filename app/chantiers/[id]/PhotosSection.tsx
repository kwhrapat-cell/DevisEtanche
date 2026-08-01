"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { queueAction, tenterVidage } from "@/lib/offline/queue";

interface Photo { id: string; url: string; legende: string | null; }

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
    const supabase = createClient();
    const chemin = `${chantierId}/${Date.now()}-${fichier.name}`;

    if (!navigator.onLine) {
      // Hors connexion : on prévient l'utilisateur, l'upload binaire ne peut pas
      // être mis en file d'attente aussi simplement qu'une écriture texte.
      setEnvoi(false);
      setErreur("Vous êtes hors connexion — reprenez la photo une fois reconnecté.");
      return;
    }

    const { error: uploadError } = await supabase.storage.from("photos").upload(chemin, fichier);
    if (uploadError) {
      setEnvoi(false);
      setErreur("L'envoi de la photo a échoué.");
      return;
    }
    const { data: urlData } = supabase.storage.from("photos").getPublicUrl(chemin);
    const { data: photo, error: dbError } = await supabase
      .from("photos")
      .insert({ chantier_id: chantierId, url: urlData.publicUrl })
      .select()
      .single();

    setEnvoi(false);
    if (dbError || !photo) {
      setErreur("Photo envoyée mais non enregistrée.");
      return;
    }
    setPhotos((prev) => [photo, ...prev]);
  }

  return (
    <div className="card p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-ardoise">Photos</h2>
        <label className="text-sm text-rouille font-medium cursor-pointer">
          {envoi ? "Envoi…" : "+ Ajouter une photo"}
          <input type="file" accept="image/*" capture="environment" onChange={surSelection} className="hidden" disabled={envoi} />
        </label>
      </div>
      {erreur && <div className="text-sm text-[#C64A2C] bg-[#F6E1DE] rounded-lg px-3 py-2 mb-3">{erreur}</div>}
      {photos.length === 0 ? (
        <p className="text-sm text-ardoise/50">Aucune photo pour l'instant.</p>
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
