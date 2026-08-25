import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * À configurer dans Stripe Dashboard > Developers > Webhooks :
 * URL : https://votre-domaine/api/webhooks/stripe
 * Événements : checkout.session.completed, customer.subscription.deleted
 * Copier le "Signing secret" dans STRIPE_WEBHOOK_SECRET.
 *
 * Utilise la clé service_role (jamais exposée au navigateur) car ce
 * endpoint doit pouvoir écrire "forfait"/"stripe_subscription_id", que RLS
 * réserve désormais à ce rôle (voir supabase/migration-securite-entreprises.sql).
 */
const supabaseAdmin = createAdminClient();

export async function POST(request: Request) {
  const corps = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(corps, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const entrepriseId = session.metadata?.entreprise_id;
    const forfait = session.metadata?.forfait;
    if (entrepriseId && forfait) {
      await supabaseAdmin
        .from("entreprises")
        .update({ forfait, stripe_subscription_id: session.subscription })
        .eq("id", entrepriseId);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as any;
    await supabaseAdmin
      .from("entreprises")
      .update({ forfait: "decouverte" })
      .eq("stripe_subscription_id", subscription.id);
  }

  return NextResponse.json({ received: true });
}
