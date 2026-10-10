"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/TopBar";
import { createClient } from "@/lib/supabase/client";
import InvitationsSection from "@/app/chantiers/[id]/InvitationsSection";
import { KeyRound } from "@/components/icons";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { InvitationSoustraitance } from "@/lib/types";

interface ChantierOption { id: string; nom: string; }

export default function CodePortefeuillePage() {
  const [entrepriseId, setEntrepriseId] = useState<string | null>(null);
  const [chantiersList, setChantiersList] = useState<ChantierOption[]>([]);
  const [chantierId, setChantierId] = useState("");
  const [invitations, setInvitations] = useState<InvitationSoustraitance[]>([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setChargement(false);
        return;
      }
      const { data: profile } = await supabase.from("profiles").select("entreprise_id").eq("id", userData.user.id).single();
      setEntrepriseId(profile?.entreprise_id ?? null);

      // Seuls les chantiers pas encore rattachés à une entreprise exécutante
      // peuvent recevoir un nouveau code — rejoindre_chantier_via_code refuse
      // les chantiers déjà rattachés.
      const { data } = await supabase
        .from("chantiers")
        .select("id, nom")
        .eq("donneur_ordre_id", userData.user.id)
        .is("entreprise_id", null)
        .order("created_at", { ascending: false });
      setChantiersList(data ?? []);
      setChargement(false);
    })();
  }, []);

  useEffect(() => {
    if (!chantierId) {
      setInvitations([]);
      return;
    }
    const supabase = createClient();
    (async () => {
      const { data } = await supabase
        .from("invitations_soustraitance")
        .select("*")
        .eq("chantier_id", chantierId)
        .eq("type_emetteur", "donneur_ordre")
        .order("created_at", { ascending: false });
      setInvitations(data ?? []);
    })();
  }, [chantierId]);

  return (
    <>
      <TopBar titre="Générer un code" sousTitre="Rattacher une entreprise exécutante à l'un de vos chantiers" />
      <div className="p-4 sm:p-8 max-w-lg flex flex-col gap-4">
        {chargement ? null : chantiersList.length === 0 ? (
          <Card>
            <EmptyState
              icone={KeyRound}
              titre="Aucun chantier disponible"
              texte="Tous vos chantiers sont déjà rattachés à une entreprise, ou vous n'en avez pas encore créé."
            />
          </Card>
        ) : (
          <>
            <Card className="p-5">
              <label className="text-xs font-mono text-encre/70 block mb-1">CHANTIER</label>
              <select value={chantierId} onChange={(e) => setChantierId(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2 text-sm">
                <option value="">— Choisir un chantier —</option>
                {chantiersList.map((c) => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            </Card>

            {chantierId && entrepriseId && (
              <InvitationsSection
                key={chantierId}
                chantierId={chantierId}
                entrepriseId={entrepriseId}
                chantierTermine={false}
                invitationsInitiales={invitations}
                typeEmetteur="donneur_ordre"
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
