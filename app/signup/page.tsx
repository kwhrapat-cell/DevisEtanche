"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import IllustrationArchitecture from "@/components/IllustrationArchitecture";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CritereMotDePasse {
  label: string;
  ok: boolean;
}

function evaluerMotDePasse(mdp: string): { score: number; criteres: CritereMotDePasse[] } {
  const criteres: CritereMotDePasse[] = [
    { label: "Au moins 8 caractères", ok: mdp.length >= 8 },
    { label: "1 lettre majuscule", ok: /[A-Z]/.test(mdp) },
    { label: "1 chiffre", ok: /[0-9]/.test(mdp) },
    { label: "1 caractère spécial", ok: /[^A-Za-z0-9]/.test(mdp) },
  ];
  const score = criteres.filter((c) => c.ok).length;
  return { score, criteres };
}

function Coche({ ok }: { ok: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={`w-4 h-4 shrink-0 ${ok ? "text-vert" : "text-neige/25"}`}>
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.4" />
      {ok && <path d="M6 10.3l2.4 2.4L14 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}

function IconeOeil({ visible }: { visible: boolean }) {
  return visible ? (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
      <path d="M3 3l18 18M10.6 10.7a3 3 0 0 0 4.2 4.2M6.7 6.8C4.2 8.4 2 12 2 12s3.5 7 10 7c1.9 0 3.5-.5 4.8-1.3M9.9 5.2C10.6 5.1 11.3 5 12 5c6.5 0 10 7 10 7-.4.8-1.3 2.1-2.6 3.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function SignupPage() {
  const [nom, setNom] = useState("");
  const [entreprise, setEntreprise] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [motDePasseVisible, setMotDePasseVisible] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);
  const router = useRouter();

  const nomValide = nom.trim().length > 1;
  const entrepriseValide = entreprise.trim().length > 1;
  const emailValide = EMAIL_RE.test(email);
  const { score, criteres } = useMemo(() => evaluerMotDePasse(motDePasse), [motDePasse]);
  const mdpValide = score === criteres.length;

  const labelForce = score <= 1 ? "Mot de passe faible" : score <= 2 ? "Mot de passe moyen" : score === 3 ? "Mot de passe bon" : "Mot de passe fort";
  const couleurForce = score <= 1 ? "#FF8A80" : score <= 2 ? "#FBBF24" : "#6EE7A0";

  const formulaireValide = nomValide && entrepriseValide && emailValide && mdpValide;
  const aCommence = nom.length > 0 || entreprise.length > 0 || email.length > 0 || motDePasse.length > 0;

  async function creerCompte(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setChargement(true);
    const supabase = createClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password: motDePasse });
    if (authError || !authData.user) {
      setChargement(false);
      setErreur(authError?.message || "Impossible de créer le compte.");
      return;
    }

    if (!authData.session) {
      setChargement(false);
      setErreur(
        "Compte créé — vérifiez votre e-mail pour confirmer votre inscription, puis reconnectez-vous pour finaliser la création de votre entreprise."
      );
      return;
    }

    // Crée l'entreprise et le profil dans une même transaction (fonction security definer) :
    // juste après un insert direct sur entreprises, aucun profil ne relie encore la ligne à
    // auth.uid(), donc la relire via la policy RLS de lecture échouait. Voir supabase/schema.sql.
    const { error: rpcError } = await supabase.rpc("creer_entreprise_et_profil", {
      p_nom_entreprise: entreprise,
      p_nom_utilisateur: nom,
    });

    setChargement(false);
    if (rpcError) {
      setErreur(rpcError.message || "Le compte a été créé mais l'entreprise n'a pas pu être enregistrée.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center bg-papier px-4 py-10">
      <IllustrationArchitecture />
      <form onSubmit={creerCompte} className="relative card w-full max-w-sm p-8">
        <div className="flex items-center gap-2 font-display font-semibold text-lg text-neige mb-1">
          <span className="w-6 h-6 rounded-md bg-gradient-to-br from-rouille to-ambre inline-block" />
          DevisEtanche
        </div>
        <p className="text-sm text-neige/50 mb-6">Créer votre espace</p>

        {erreur && <div className="text-sm text-[#FF8A80] bg-[#3B1418] rounded-lg px-3 py-2 mb-4">{erreur}</div>}
        {!erreur && aCommence && (
          <div
            className="text-sm rounded-lg px-3 py-2 mb-4"
            style={
              formulaireValide
                ? { color: "#6EE7A0", background: "rgba(110,231,160,0.12)" }
                : { color: "#EAF0FB99", background: "rgba(234,240,251,0.06)" }
            }
          >
            {formulaireValide ? "Aucun problème détecté. Vous pouvez créer votre compte." : "Complétez les champs ci-dessous pour continuer."}
          </div>
        )}

        <label className="text-xs font-mono text-neige/60 block mb-1">VOTRE NOM</label>
        <div className="relative mb-4">
          <input required value={nom} onChange={(e) => setNom(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2 pr-9" />
          {nom.length > 0 && <span className="absolute right-3 top-1/2 -translate-y-1/2"><Coche ok={nomValide} /></span>}
        </div>

        <label className="text-xs font-mono text-neige/60 block mb-1">NOM DE L'ENTREPRISE</label>
        <div className="relative mb-4">
          <input required value={entreprise} onChange={(e) => setEntreprise(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2 pr-9" />
          {entreprise.length > 0 && <span className="absolute right-3 top-1/2 -translate-y-1/2"><Coche ok={entrepriseValide} /></span>}
        </div>

        <label className="text-xs font-mono text-neige/60 block mb-1">E-MAIL</label>
        <div className="relative mb-4">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2 pr-9" />
          {email.length > 0 && <span className="absolute right-3 top-1/2 -translate-y-1/2"><Coche ok={emailValide} /></span>}
        </div>

        <label className="text-xs font-mono text-neige/60 block mb-1">MOT DE PASSE</label>
        <div className="relative mb-2">
          <input
            type={motDePasseVisible ? "text" : "password"}
            required
            minLength={8}
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            className="w-full border border-ligne rounded-lg px-3 py-2 pr-9"
          />
          <button
            type="button"
            onClick={() => setMotDePasseVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neige/40 hover:text-neige/70"
            aria-label={motDePasseVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            <IconeOeil visible={motDePasseVisible} />
          </button>
        </div>

        {motDePasse.length > 0 && (
          <div className="mb-3">
            <div className="flex gap-1 mb-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1 flex-1 rounded-full"
                  style={{ background: score > i * (criteres.length / 3) ? couleurForce : "rgba(234,240,251,0.12)" }}
                />
              ))}
            </div>
            <span className="text-xs font-medium" style={{ color: couleurForce }}>{labelForce}</span>
          </div>
        )}

        <div className="rounded-lg px-3 py-2.5 mb-6" style={{ background: "rgba(234,240,251,0.04)" }}>
          <div className="text-xs font-medium text-neige/70 mb-1.5">Votre sécurité est notre priorité</div>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
            {criteres.map((c) => (
              <li key={c.label} className="flex items-center gap-1.5 text-xs text-neige/60">
                <Coche ok={c.ok} />
                {c.label}
              </li>
            ))}
          </ul>
        </div>

        <button type="submit" disabled={chargement} className="w-full bg-rouille text-white font-semibold rounded-lg py-2.5 disabled:opacity-60">
          {chargement ? "Création…" : "Créer mon compte"}
        </button>
        <p className="text-xs text-neige/50 text-center mt-5">
          Déjà un compte ? <Link href="/login" className="text-rouille font-medium">Se connecter</Link>
        </p>
        <p className="text-xs text-neige/50 text-center mt-2">
          Vous avez été invité par une entreprise ?{" "}
          <Link href="/rejoindre-chantier" className="text-rouille font-medium">Rejoindre un chantier avec un code</Link>
        </p>
      </form>
    </div>
  );
}
