"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { genererCodeInvitation, labelRoleSousTraitance, dureesValidite, DUREE_PERSONNALISEE } from "@/lib/invitations";
import type { InvitationSoustraitance, RoleSousTraitance } from "@/lib/types";

interface Props {
  chantierId: string;
  entrepriseId: string;
  chantierTermine: boolean;
  invitationsInitiales: InvitationSoustraitance[];
}

function estActive(inv: InvitationSoustraitance): boolean {
  return !inv.utilise && !inv.revoquee && new Date(inv.date_expiration).getTime() > Date.now();
}

// Un code déjà utilisé a définitivement rattaché son sous-traitant au chantier
// (chantier_assigne_id) — rien à prolonger. Un code encore actif n'en a pas
// besoin non plus. Seuls les codes expirés ou annulés, jamais utilisés,
// peuvent être prolongés pour rester distribuables.
function peutProlonger(inv: InvitationSoustraitance): boolean {
  return !inv.utilise && !estActive(inv);
}

function statutInvitation(inv: InvitationSoustraitance): { label: string; classe: string } {
  if (inv.revoquee) return { label: "Annulée", classe: "text-neige/40" };
  if (inv.utilise) return { label: "Utilisée", classe: "text-vert" };
  if (new Date(inv.date_expiration).getTime() <= Date.now()) return { label: "Expirée", classe: "text-neige/40" };
  return { label: "Active", classe: "text-ambre" };
}

// Format attendu par <input type="datetime-local"> ("YYYY-MM-DDTHH:mm", heure locale).
function minDatetimeLocal(margeMinutes = 5): string {
  const d = new Date(Date.now() + margeMinutes * 60_000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Convertit la sélection de durée (préréglage en heures, ou date personnalisée)
// en date d'expiration ISO. Renvoie null si la date personnalisée est absente
// ou déjà passée.
function calculerDateExpiration(dureeSelection: string, dateCustom: string): string | null {
  if (dureeSelection === DUREE_PERSONNALISEE) {
    if (!dateCustom) return null;
    const d = new Date(dateCustom);
    if (Number.isNaN(d.getTime()) || d.getTime() <= Date.now()) return null;
    return d.toISOString();
  }
  const heures = Number(dureeSelection);
  return new Date(Date.now() + heures * 3600_000).toISOString();
}

function SelecteurDuree({
  dureeSelection,
  setDureeSelection,
  dateCustom,
  setDateCustom,
}: {
  dureeSelection: string;
  setDureeSelection: (v: string) => void;
  dateCustom: string;
  setDateCustom: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-mono text-neige/60 block mb-1">DURÉE DE VALIDITÉ</label>
      <select
        value={dureeSelection}
        onChange={(e) => setDureeSelection(e.target.value)}
        className="w-full border border-ligne rounded-lg px-3 py-2 text-sm"
      >
        {dureesValidite.map((d) => (
          <option key={d.heures} value={String(d.heures)}>{d.label}</option>
        ))}
        <option value={DUREE_PERSONNALISEE}>Durée personnalisée</option>
      </select>
      {dureeSelection === DUREE_PERSONNALISEE && (
        <input
          type="datetime-local"
          value={dateCustom}
          min={minDatetimeLocal()}
          onChange={(e) => setDateCustom(e.target.value)}
          className="w-full border border-ligne rounded-lg px-3 py-2 text-sm mt-2"
        />
      )}
    </div>
  );
}

export default function InvitationsSection({ chantierId, entrepriseId, chantierTermine, invitationsInitiales }: Props) {
  const [ouvert, setOuvert] = useState(false);
  const [role, setRole] = useState<RoleSousTraitance>("ouvrier");
  const [dureeSelection, setDureeSelection] = useState<string>("48");
  const [dateCustom, setDateCustom] = useState("");
  const [invitations, setInvitations] = useState(invitationsInitiales);
  const [codeCopie, setCodeCopie] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);

  const [prolongationOuverte, setProlongationOuverte] = useState<string | null>(null);
  const [prolongationDuree, setProlongationDuree] = useState<string>("48");
  const [prolongationDateCustom, setProlongationDateCustom] = useState("");

  async function genererInvitation(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);

    const dateExpiration = calculerDateExpiration(dureeSelection, dateCustom);
    if (!dateExpiration) {
      setErreur("Veuillez choisir une date de fin valide, dans le futur.");
      return;
    }

    setChargement(true);
    const supabase = createClient();

    let derniereErreur: string | null = null;
    for (let tentative = 0; tentative < 5; tentative++) {
      const { data, error } = await supabase
        .from("invitations_soustraitance")
        .insert({
          code: genererCodeInvitation(),
          chantier_id: chantierId,
          entreprise_id: entrepriseId,
          role_autorise: role,
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

  function ouvrirProlongation(id: string) {
    setErreur(null);
    setProlongationDuree("48");
    setProlongationDateCustom("");
    setProlongationOuverte(id);
  }

  // Prolonge l'accès en repoussant la date d'expiration du code existant
  // (et en levant une éventuelle annulation) plutôt qu'en générant un nouveau
  // code : le sous-traitant qui a déjà ce code n'a rien à recopier, et le lien
  // de suivi client (token_public du chantier) n'est jamais touché — l'accès
  // client reste valide sans changement.
  async function prolongerAcces(id: string) {
    setErreur(null);
    const dateExpiration = calculerDateExpiration(prolongationDuree, prolongationDateCustom);
    if (!dateExpiration) {
      setErreur("Veuillez choisir une date de fin valide, dans le futur.");
      return;
    }

    setChargement(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("invitations_soustraitance")
      .update({ date_expiration: dateExpiration, revoquee: false })
      .eq("id", id)
      .select()
      .single();
    setChargement(false);

    if (error || !data) {
      setErreur("Impossible de prolonger l'accès.");
      return;
    }

    setInvitations((prev) => prev.map((inv) => (inv.id === id ? (data as InvitationSoustraitance) : inv)));
    setProlongationOuverte(null);
  }

  function copierCode(code: string) {
    navigator.clipboard.writeText(code);
    setCodeCopie(code);
    setTimeout(() => setCodeCopie((c) => (c === code ? null : c)), 2000);
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium text-neige">Sous-traitance</div>
        {!ouvert && (
          <button
            onClick={() => setOuvert(true)}
            disabled={chantierTermine}
            className="text-xs bg-rouille text-white font-semibold rounded-lg px-3 py-1.5 disabled:opacity-40"
          >
            Inviter un sous-traitant
          </button>
        )}
      </div>

      {chantierTermine && <p className="text-xs text-neige/40 mb-2">Chantier terminé — les invitations ne sont plus disponibles.</p>}

      {erreur && <div className="text-sm text-[#FF8A80] bg-[#3B1418] rounded-lg px-3 py-2 my-2">{erreur}</div>}

      {ouvert && !chantierTermine && (
        <form onSubmit={genererInvitation} className="flex flex-col gap-3 my-3 bg-sable/40 rounded-lg p-3">
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
          <SelecteurDuree
            dureeSelection={dureeSelection}
            setDureeSelection={setDureeSelection}
            dateCustom={dateCustom}
            setDateCustom={setDateCustom}
          />
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
              <li key={inv.id} className="flex flex-col gap-2 text-sm bg-sable/30 rounded-lg px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-neige tracking-wider">{inv.code}</span>
                      <span className={`text-xs ${statut.classe}`}>{statut.label}</span>
                    </div>
                    <div className="text-xs text-neige/45">
                      {labelRoleSousTraitance[inv.role_autorise]} · expire le {new Date(inv.date_expiration).toLocaleString("fr-FR")}
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
                    {!chantierTermine && peutProlonger(inv) && (
                      <button
                        onClick={() => (prolongationOuverte === inv.id ? setProlongationOuverte(null) : ouvrirProlongation(inv.id))}
                        className="text-xs bg-rouille/10 text-rouille font-semibold rounded-lg px-2.5 py-1.5 hover:bg-rouille/20"
                      >
                        Prolonger l'accès
                      </button>
                    )}
                  </div>
                </div>

                {prolongationOuverte === inv.id && (
                  <div className="flex flex-col gap-2 bg-ardoise/5 rounded-lg p-3">
                    <SelecteurDuree
                      dureeSelection={prolongationDuree}
                      setDureeSelection={setProlongationDuree}
                      dateCustom={prolongationDateCustom}
                      setDateCustom={setProlongationDateCustom}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => prolongerAcces(inv.id)}
                        disabled={chargement}
                        className="flex-1 bg-rouille text-white font-semibold rounded-lg py-2 text-sm disabled:opacity-60"
                      >
                        {chargement ? "Prolongation…" : "Confirmer la prolongation"}
                      </button>
                      <button type="button" onClick={() => setProlongationOuverte(null)} className="text-sm text-neige/50 px-3">
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
