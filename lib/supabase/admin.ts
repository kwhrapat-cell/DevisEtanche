import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase avec la clé service_role (jamais exposée au navigateur) :
 * contourne RLS et les GRANT de "authenticated". Réservé aux écritures
 * serveur qui doivent toucher des colonnes non accessibles depuis une session
 * utilisateur normale (ex. entreprises.forfait / stripe_customer_id /
 * stripe_subscription_id — voir supabase/migration-securite-entreprises.sql).
 */
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}
