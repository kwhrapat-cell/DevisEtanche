import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageVitrine from "@/components/vitrine/PageVitrine";
import { pageAccueil } from "@/lib/accueil";
import { getUtilisateurCourant } from "@/lib/supabase/auth";

const TITRE = "DevisEtanche — le logiciel des chantiers d'étanchéité";
const DESCRIPTION =
  "Chiffrez une toiture-terrasse selon les DTU avec les vraies références fabricants, puis suivez chaque zone jusqu'à la réception. Sur le téléphone, même sans réseau.";

// Aperçu affiché quand le lien est partagé (LinkedIn, Facebook, WhatsApp, Messenger).
export const metadata: Metadata = {
  title: TITRE,
  description: DESCRIPTION,
  openGraph: {
    title: TITRE,
    description: DESCRIPTION,
    type: "website",
    locale: "fr_FR",
    siteName: "DevisEtanche",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "DevisEtanche, le logiciel des chantiers d'étanchéité" }],
  },
};

/**
 * Racine du site : les connectés vont sur l'accueil de leur rôle ; les visiteurs voient
 * la page d'accueil publique. L'appli installée s'ouvre sur « /?source=appli »
 * (public/manifest.json) : hors session, elle mène directement à la connexion.
 */
export default async function Home({ searchParams }: { searchParams: Promise<{ source?: string | string[] }> }) {
  const session = await getUtilisateurCourant();
  if (session) redirect(pageAccueil(session.profile?.role));

  const { source } = await searchParams;
  if (source === "appli") redirect("/login");

  return <PageVitrine />;
}
