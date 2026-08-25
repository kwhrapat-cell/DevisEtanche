import { NextResponse } from "next/server";
import { stripe, PRIX_STRIPE } from "@/lib/stripe/client";
import { getUtilisateurCourant } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const { forfait } = await request.json();
  const prixId = PRIX_STRIPE[forfait];
  if (!prixId) {
    return NextResponse.json({ error: "Forfait inconnu" }, { status: 400 });
  }

  const session = await getUtilisateurCourant();
  if (!session?.profile) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: entreprise } = await supabase
    .from("entreprises")
    .select("id, stripe_customer_id, nom")
    .eq("id", session.profile.entreprise_id)
    .single();

  let customerId = entreprise?.stripe_customer_id ?? undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      name: entreprise?.nom,
      email: session.user.email,
      metadata: { entreprise_id: session.profile.entreprise_id },
    });
    customerId = customer.id;
    // stripe_customer_id n'est plus modifiable par une session utilisateur normale
    // (voir supabase/migration-securite-entreprises.sql) : ce endpoint a déjà vérifié
    // la session et dérivé entreprise_id côté serveur, l'écriture via service_role
    // ici est donc sûre — contrairement à un accès direct au client.
    const supabaseAdmin = createAdminClient();
    await supabaseAdmin.from("entreprises").update({ stripe_customer_id: customerId }).eq("id", session.profile.entreprise_id);
  }

  const origine = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: prixId, quantity: 1 }],
    success_url: `${origine}/parametres?paiement=succes`,
    cancel_url: `${origine}/parametres?paiement=annule`,
    metadata: { entreprise_id: session.profile.entreprise_id, forfait },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
