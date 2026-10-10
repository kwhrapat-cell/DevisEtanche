"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "@/components/icons";
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
    <button
      onClick={seDeconnecter}
      className="shrink-0 rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
      aria-label="Se déconnecter"
      title="Se déconnecter"
    >
      <LogOut size={18} />
    </button>
  );
}
