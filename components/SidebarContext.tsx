"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

export interface ProfilCourant {
  nom: string;
  role: string;
  /** Non nul pour un sous-traitant restreint à un seul chantier. */
  chantier_assigne_id: string | null;
}

interface SidebarState {
  ouvert: boolean;
  setOuvert: (v: boolean) => void;
  /** Profil de l'utilisateur connecté, chargé une seule fois pour toute l'interface. */
  profil: ProfilCourant | null;
  /** Sous-traitant restreint : pas d'accès aux devis, factures, clients, paramètres. */
  restreint: boolean;
}

const SidebarContext = createContext<SidebarState | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [ouvert, setOuvert] = useState(false);
  const [profil, setProfil] = useState<ProfilCourant | null>(null);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data } = await supabase.from("profiles").select("nom, role, chantier_assigne_id").eq("id", userData.user.id).single();
      if (data) setProfil(data);
    })();
  }, []);

  return (
    <SidebarContext.Provider value={{ ouvert, setOuvert, profil, restreint: !!profil?.chantier_assigne_id }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarState {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar doit être utilisé sous SidebarProvider");
  return ctx;
}

export const LABEL_ROLE: Record<string, string> = {
  ouvrier: "Ouvrier",
  chef_de_chantier: "Chef de chantier",
  conducteur_de_travaux: "Conducteur de travaux",
  administrateur: "Administrateur",
  client: "Client",
};
