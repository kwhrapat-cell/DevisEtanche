import { createClient } from "@/lib/supabase/client";

export interface PhotoChantier {
  id: string;
  url: string;
  legende: string | null;
}

const HORS_LIGNE = "Vous êtes hors connexion — reprenez la photo une fois reconnecté.";

/** Dépose un fichier dans le dossier du chantier (bucket "photos") et renvoie son adresse publique. */
async function deposerFichier(chantierId: string, fichier: File): Promise<string | null> {
  const supabase = createClient();
  const chemin = `${chantierId}/${Date.now()}-${fichier.name}`;
  const { error } = await supabase.storage.from("photos").upload(chemin, fichier);
  if (error) return null;
  return supabase.storage.from("photos").getPublicUrl(chemin).data.publicUrl;
}

/**
 * Envoie une photo dans le stockage puis l'enregistre sur le chantier
 * (et sur une zone si `zoneId` est donné). Renvoie la photo créée, ou un message d'erreur lisible.
 */
export async function envoyerPhoto(
  chantierId: string,
  fichier: File,
  zoneId?: string
): Promise<{ photo: PhotoChantier } | { erreur: string }> {
  // Hors connexion : l'upload binaire ne peut pas être mis en file d'attente
  // aussi simplement qu'une écriture texte.
  if (!navigator.onLine) return { erreur: HORS_LIGNE };

  const url = await deposerFichier(chantierId, fichier);
  if (!url) return { erreur: "L'envoi de la photo a échoué." };

  const { data: photo, error: dbError } = await createClient()
    .from("photos")
    .insert({ chantier_id: chantierId, url, ...(zoneId ? { zone_id: zoneId } : {}) })
    .select()
    .single();

  if (dbError || !photo) return { erreur: "Photo envoyée mais non enregistrée." };
  return { photo };
}

/** Envoie l'image du plan et la rattache au chantier (remplace le plan précédent). */
export async function envoyerPlan(chantierId: string, fichier: File): Promise<{ url: string } | { erreur: string }> {
  if (!navigator.onLine) return { erreur: "Vous êtes hors connexion — ajoutez le plan une fois reconnecté." };

  const url = await deposerFichier(chantierId, fichier);
  if (!url) return { erreur: "L'envoi du plan a échoué." };

  const { error } = await createClient().from("chantiers").update({ plan_url: url }).eq("id", chantierId);
  if (error) return { erreur: "Plan envoyé mais non enregistré sur le chantier." };
  return { url };
}
