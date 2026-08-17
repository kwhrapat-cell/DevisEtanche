"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const labelRole: Record<string, string> = {
  ouvrier: "Ouvrier",
  chef_de_chantier: "Chef de chantier",
  conducteur_de_travaux: "Conducteur de travaux",
  administrateur: "Administrateur",
  client: "Client",
};

export default function TopBar({ titre, sousTitre }: { titre: string; sousTitre?: string }) {
  const [profil, setProfil] = useState<{ nom: string; role: string } | null>(null);

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
    <div className="flex items-center justify-between px-8 py-6 border-b border-ligne">
      <div>
        <h1 className="font-display text-2xl font-semibold text-neige">{titre}</h1>
        {sousTitre && <p className="text-sm text-neige/50 mt-1">{sousTitre}</p>}
      </div>
      <div className="flex items-center gap-4">
        <input
          placeholder="Rechercher un chantier, un client, un devis…"
          className="hidden md:block w-80 border border-ligne rounded-lg px-3 py-2 text-sm bg-[#0B1220] text-neige placeholder:text-neige/35"
        />
        {profil && (
          <div className="flex items-center gap-2.5 pl-4 border-l border-ligne shrink-0">
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
