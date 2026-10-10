import { createClient } from "@/lib/supabase/client";

/** Point d'un contour de zone, en fraction de l'image du plan (0 à 1). */
export type Point = [number, number];

const HORS_LIGNE = "Connexion nécessaire pour enregistrer cette modification.";

/** Change le statut d'une zone. Renvoie un message d'erreur, ou null si tout va bien. */
export async function changerStatutZone(zoneId: string, statut: string): Promise<string | null> {
  if (!navigator.onLine) return HORS_LIGNE;
  const { error } = await createClient().from("zones").update({ statut }).eq("id", zoneId);
  return error ? "Le statut n'a pas pu être enregistré." : null;
}

/** Enregistre la forme d'une zone sur le plan (null pour la retirer du plan). */
export async function enregistrerContour(zoneId: string, contour: Point[] | null): Promise<string | null> {
  if (!navigator.onLine) return HORS_LIGNE;
  const arrondi = contour?.map(([x, y]) => [Math.round(x * 10000) / 10000, Math.round(y * 10000) / 10000]) ?? null;
  const { error } = await createClient().from("zones").update({ contour: arrondi }).eq("id", zoneId);
  return error ? "La forme de la zone n'a pas pu être enregistrée." : null;
}
