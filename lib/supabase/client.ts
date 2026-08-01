import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase utilisable dans les composants "use client".
 * Nécessite NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY
 * dans .env.local (voir .env.example).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
