"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSidebar } from "@/components/SidebarContext";

const labelRole: Record<string, string> = {
  ouvrier: "Ouvrier",
  chef_de_chantier: "Chef de chantier",
  conducteur_de_travaux: "Conducteur de travaux",
  administrateur: "Administrateur",
  client: "Client",
  donneur_ordre: "Donneur d'ordre",
};

export default function TopBar({ titre, sousTitre }: { titre: string; sousTitre?: string }) {
  const [profil, setProfil] = useState<{ nom: string; role: string } | null>(null);
  const { setOuvert } = useSidebar();

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data } = await supabase.from("profiles").select("nom, role").eq("id", userData.user.id).single();
      if (data) setProfil(data);
    })();
  }, []);

  const initiales = profil?.nom
    ? profil.nom.trim().split(/\s+/).map((s) => s[0]).slice(0, 2).join("").toUpperCase()
    : "";

  return (
    <div className="flex items-center justify-between gap-3 px-4 sm:px-8 py-4 sm:py-6 border-b border-ligne">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setOuvert(true)}
          className="md:hidden text-neige/70 hover:text-neige text-xl leading-none shrink-0"
          aria-label="Ouvrir le menu"
        >
          ☰
        </button>
        <div className="min-w-0">
          <h1 className="font-display text-lg sm:text-2xl font-semibold text-neige truncate">{titre}</h1>
          {sousTitre && <p className="text-xs sm:text-sm text-neige/50 mt-0.5 sm:mt-1 truncate">{sousTitre}</p>}
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <input
          placeholder="Rechercher un chantier, un client, un devis…"
          className="hidden md:block w-80 border border-ligne rounded-lg px-3 py-2 text-sm bg-[#0B1220] text-neige placeholder:text-neige/35"
        />
        {profil && (
          <div className="flex items-center gap-2.5 md:pl-4 md:border-l border-ligne shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rouille to-ambre flex items-center justify-center text-white text-xs font-semibold shrink-0">
              {initiales}
            </div>
            <div className="hidden lg:block leading-tight">
              <div className="text-sm font-medium text-neige">{profil.nom}</div>
              <div className="text-xs text-neige/45">{labelRole[profil.role] ?? profil.role}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
