import { createClient } from "@/lib/supabase/server";

/** Récupère l'utilisateur connecté, son profil (entreprise, rôle) et la devise/taxe
 *  de son entreprise (XPF/TGC en Nouvelle-Calédonie, EUR/TVA en France). Renvoie null hors session. */
export async function getUtilisateurCourant() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  const { data: entreprise } = profile?.entreprise_id
    ? await supabase.from("entreprises").select("devise, libelle_taxe, taux_taxe_defaut").eq("id", profile.entreprise_id).single()
    : { data: null };

  return { user, profile, entreprise };
}
