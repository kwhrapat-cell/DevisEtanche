import { createClient } from "@/lib/supabase/server";

/** Récupère l'utilisateur connecté et son profil (entreprise, rôle). Renvoie null hors session. */
export async function getUtilisateurCourant() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return { user, profile };
}
