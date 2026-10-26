import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase avec la clé service_role (jamais exposée au navigateur) :
 * contourne RLS et les GRANT de "authenticated". Réservé aux écritures
 * serveur qui doivent toucher des colonnes non accessibles depuis une session
 * utilisateur normale (ex. entreprises.forfait et les colonnes paiement_* remplies par le webhook
 * Lemon Squeezy — voir supabase/migration-paiement-lemonsqueezy.sql).
 */
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}
