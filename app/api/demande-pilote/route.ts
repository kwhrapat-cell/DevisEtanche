import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Demande « entreprise pilote » envoyée depuis la page d'accueil publique.
 * Enregistrée dans `demandes_pilote` (supabase/migration-demandes-pilote.sql) avec la
 * clé serveur : la table n'est ni lisible ni modifiable depuis le navigateur.
 */

/** Texte nettoyé et coupé à `max` caractères ; chaîne vide si absent. */
function texte(valeur: unknown, max: number): string {
  return typeof valeur === "string" ? valeur.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  let corps: Record<string, unknown>;
  try {
    corps = await request.json();
  } catch {
    return NextResponse.json({ erreur: "Demande illisible." }, { status: 400 });
  }

  // Robots : champ caché rempli, ou formulaire envoyé en moins de 2 secondes.
  // On répond « ok » sans rien enregistrer, pour ne pas leur apprendre à contourner.
  const duree = Number(corps.duree_ms);
  if (texte(corps.site_web, 200) || !Number.isFinite(duree) || duree < 2000) {
    return NextResponse.json({ ok: true });
  }

  const nom = texte(corps.nom, 120);
  const entreprise = texte(corps.entreprise, 160);
  const contact = texte(corps.contact, 160);
  const message = texte(corps.message, 2000);
  const source = texte(corps.source, 80);

  if (nom.length < 2 || entreprise.length < 2 || contact.length < 5) {
    return NextResponse.json({ erreur: "Indiquez votre nom, votre entreprise et un téléphone ou un e-mail." }, { status: 400 });
  }

  try {
    const { error } = await createAdminClient()
      .from("demandes_pilote")
      .insert({ nom, entreprise, contact, message: message || null, source: source || null });
    if (error) throw error;
  } catch (err) {
    console.error("demande-pilote :", err instanceof Error ? err.message : err);
    return NextResponse.json({ erreur: "La demande n'a pas pu être enregistrée." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
