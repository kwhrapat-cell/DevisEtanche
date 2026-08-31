"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { genererCodeInvitation, labelRoleSousTraitance, dureesValidite } from "@/lib/invitations";
import type { InvitationSoustraitance, RoleSousTraitance, TypeEmetteurInvitation } from "@/lib/types";

interface Props {
  chantierId: string;
  entrepriseId: string;
  chantierTermine: boolean;
  invitationsInitiales: InvitationSoustraitance[];
  /**
   * "entreprise" (défaut) : invitation d'un sous-traitant avec un rôle restreint à ce chantier.
   * "donneur_ordre" : code rattachant une entreprise exécutante entière (rôle_autorise nul).
   */
  typeEmetteur?: TypeEmetteurInvitation;
}

function estActive(inv: InvitationSoustraitance): boolean {
  return !inv.utilise && !inv.revoquee && new Date(inv.date_expiration).getTime() > Date.now();
}

function statutInvitation(inv: InvitationSoustraitance): { label: string; classe: string } {
  if (inv.revoquee) return { label: "Annulée", classe: "text-neige/40" };
  if (inv.utilise) return { label: "Utilisée", classe: "text-vert" };
  if (new Date(inv.date_expiration).getTime() <= Date.now()) return { label: "Expirée", classe: "text-neige/40" };
  return { label: "Active", classe: "text-ambre" };
}

export default function InvitationsSection({ chantierId, entrepriseId, chantierTermine, invitationsInitiales, typeEmetteur = "entreprise" }: Props) {
  const estDonneurOrdre = typeEmetteur === "donneur_ordre";
  const [ouvert, setOuvert] = useState(false);
  const [role, setRole] = useState<RoleSousTraitance>("ouvrier");
  const [dureeHeures, setDureeHeures] = useState(48);
  const [invitations, setInvitations] = useState(invitationsInitiales);
  const [codeCopie, setCodeCopie] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);

  async function genererInvitation(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setChargement(true);
    const supabase = createClient();

    const dateExpiration = new Date(Date.now() + dureeHeures * 3600_000).toISOString();

    let derniereErreur: string | null = null;
    for (let tentative = 0; tentative < 5; tentative++) {
      const { data, error } = await supabase
        .from("invitations_soustraitance")
        .insert({
          code: genererCodeInvitation(),
          chantier_id: chantierId,
          entreprise_id: entrepriseId,
          role_autorise: estDonneurOrdre ? null : role,
          type_emetteur: typeEmetteur,
          date_expiration: dateExpiration,
        })
        .select()
        .single();

      if (!error && data) {
        setInvitations((prev) => [data as InvitationSoustraitance, ...prev]);
        setChargement(false);
        return;
      }

      if (error?.code === "23505") {
        derniereErreur = "Collision de code, nouvelle tentative…";
        continue;
      }
      derniereErreur = error?.message || "Impossible de générer le code d'invitation.";
      break;
    }

    setChargement(false);
    setErreur(derniereErreur);
  }

  async function annulerInvitation(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("invitations_soustraitance").update({ revoquee: true }).eq("id", id);
    if (error) {
      setErreur("Impossible d'annuler cette invitation.");
      return;
    }
    setInvitations((prev) => prev.map((inv) => (inv.id === id ? { ...inv, revoquee: true } : inv)));
  }

  function copierCode(code: string) {
    navigator.clipboard.writeText(code);
    setCodeCopie(code);
    setTimeout(() => setCodeCopie((c) => (c === code ? null : c)), 2000);
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium text-neige">{estDonneurOrdre ? "Rattacher une entreprise" : "Sous-traitance"}</div>
        {!ouvert && (
          <button
            onClick={() => setOuvert(true)}
            disabled={chantierTermine}
            className="text-xs bg-rouille text-white font-semibold rounded-lg px-3 py-1.5 disabled:opacity-40"
          >
            {estDonneurOrdre ? "Générer un code" : "Inviter un sous-traitant"}
          </button>
        )}
      </div>

      {chantierTermine && <p className="text-xs text-neige/40 mb-2">Chantier terminé — les invitations ne sont plus disponibles.</p>}

      {erreur && <div className="text-sm text-[#FF8A80] bg-[#3B1418] rounded-lg px-3 py-2 my-2">{erreur}</div>}

      {ouvert && !chantierTermine && (
        <form onSubmit={genererInvitation} className="flex flex-col gap-3 my-3 bg-sable/40 rounded-lg p-3">
          {!estDonneurOrdre && (
            <div>
              <label className="text-xs font-mono text-neige/60 block mb-1">RÔLE AUTORISÉ</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as RoleSousTraitance)}
                className="w-full border border-ligne rounded-lg px-3 py-2 text-sm"
              >
                {Object.entries(labelRoleSousTraitance).map(([valeur, label]) => (
                  <option key={valeur} value={valeur}>{label}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="text-xs font-mono text-neige/60 block mb-1">DURÉE DE VALIDITÉ</label>
            <select
              value={dureeHeures}
              onChange={(e) => setDureeHeures(Number(e.target.value))}
              className="w-full border border-ligne rounded-lg px-3 py-2 text-sm"
            >
              {dureesValidite.map((d) => (
                <option key={d.heures} value={d.heures}>{d.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={chargement} className="flex-1 bg-rouille text-white font-semibold rounded-lg py-2 text-sm disabled:opacity-60">
              {chargement ? "Génération…" : "Générer le code"}
            </button>
            <button type="button" onClick={() => setOuvert(false)} className="text-sm text-neige/50 px-3">
              Annuler
            </button>
          </div>
        </form>
      )}

      {invitations.length === 0 ? (
        <p className="text-sm text-neige/50 mt-2">Aucune invitation pour l'instant.</p>
      ) : (
        <ul className="flex flex-col gap-2 mt-3">
          {invitations.map((inv) => {
            const active = estActive(inv);
            const statut = statutInvitation(inv);
            return (
              <li key={inv.id} className="flex items-center justify-between gap-2 text-sm bg-sable/30 rounded-lg px-3 py-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-neige tracking-wider">{inv.code}</span>
                    <span className={`text-xs ${statut.classe}`}>{statut.label}</span>
                  </div>
                  <div className="text-xs text-neige/45">
                    {inv.role_autorise ? labelRoleSousTraitance[inv.role_autorise] : "Rattachement entreprise complète"} · expire le{" "}
                    {new Date(inv.date_expiration).toLocaleString("fr-FR")}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {active && (
                    <>
                      <button onClick={() => copierCode(inv.code)} className="text-xs bg-ardoise/5 text-neige rounded-lg px-2.5 py-1.5 hover:bg-ardoise/10">
                        {codeCopie === inv.code ? "Copié ✓" : "Copier"}
                      </button>
                      <button onClick={() => annulerInvitation(inv.id)} className="text-xs text-[#FF8A80] hover:underline">
                        Annuler l'invitation
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
