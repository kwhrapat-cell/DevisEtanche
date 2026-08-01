"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function BoutonDeconnexion() {
  const router = useRouter();

  async function seDeconnecter() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button onClick={seDeconnecter} className="text-xs text-white/50 hover:text-white transition">
      Se déconnecter
    </button>
  );
}
