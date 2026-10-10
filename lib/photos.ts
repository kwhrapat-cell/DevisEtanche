import { createClient } from "@/lib/supabase/client";

export interface PhotoChantier {
  id: string;
  url: string;
  legende: string | null;
}

/**
 * Envoie une photo dans le stockage puis l'enregistre sur le chantier.
 * Renvoie la photo créée, ou un message d'erreur lisible.
 */
export async function envoyerPhoto(chantierId: string, fichier: File): Promise<{ photo: PhotoChantier } | { erreur: string }> {
  if (!navigator.onLine) {
    // Hors connexion : l'upload binaire ne peut pas être mis en file d'attente
    // aussi simplement qu'une écriture texte.
    return { erreur: "Vous êtes hors connexion — reprenez la photo une fois reconnecté." };
  }

  const supabase = createClient();
  const chemin = `${chantierId}/${Date.now()}-${fichier.name}`;

  const { error: uploadError } = await supabase.storage.from("photos").upload(chemin, fichier);
  if (uploadError) return { erreur: "L'envoi de la photo a échoué." };

  const { data: urlData } = supabase.storage.from("photos").getPublicUrl(chemin);
  const { data: photo, error: dbError } = await supabase
    .from("photos")
    .insert({ chantier_id: chantierId, url: urlData.publicUrl })
    .select()
    .single();

  if (dbError || !photo) return { erreur: "Photo envoyée mais non enregistrée." };
  return { photo };
}
