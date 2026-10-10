import { redirect } from "next/navigation";
import { pageAccueil } from "@/lib/accueil";
import { getUtilisateurCourant } from "@/lib/supabase/auth";

export default async function Home() {
  const session = await getUtilisateurCourant();
  redirect(session ? pageAccueil(session.profile?.role) : "/login");
}
