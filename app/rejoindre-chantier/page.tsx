"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import IllustrationArchitecture from "@/components/IllustrationArchitecture";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Etape = "verification" | "deja_associe" | "code_administrateur" | "compte" | "code";

function EnTete() {
  return (
    <div className="flex items-center gap-2 font-display font-semibold text-lg text-neige mb-1">
      <span className="w-6 h-6 rounded-md bg-gradient-to-br from-rouille to-ambre inline-block" />
      DevisEtanche
    </div>
  );
}

function mapErreurRpc(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("code invalide")) return "Ce code d'invitation est invalide.";
  if (m.includes("déjà été utilisé")) return "Ce code a déjà été utilisé.";
  if (m.includes("annulé")) return "Ce code a été annulé par l'entreprise.";
  if (m.includes("expiré")) return "Ce code a expiré — demandez-en un nouveau à l'entreprise.";
  if (m.includes("terminé")) return "Ce chantier est terminé, le code n'est plus valide.";
  if (m.includes("profil existe déjà")) return "Ce compte est déjà associé à une entreprise.";
  return message;
}

export default function RejoindreChantierPage() {
  const [etape, setEtape] = useState<Etape>("verification");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [code, setCode] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setEtape("compte");
        return;
      }
      const { data: profile } = await supabase.from("profiles").select("id, nom, role").eq("id", userData.user.id).single();
      if (!profile) {
        setEtape("code");
        return;
      }
      // Un compte administrateur déjà existant peut saisir un code émis par un
      // donneur d'ordre pour rattacher son entreprise à un nouveau chantier —
      // seul ce cas garde la saisie de code ouverte après création du compte.
      if (profile.role === "administrateur") {
        setNom(profile.nom);
        setEtape("code_administrateur");
        return;
      }
      setEtape("deja_associe");
    })();
  }, []);

  async function creerCompte(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);

    if (!EMAIL_RE.test(email)) {
      setErreur("Veuillez saisir une adresse e-mail valide.");
      return;
    }
    if (motDePasse.length < 8) {
      setErreur("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (nom.trim().length < 2) {
      setErreur("Veuillez indiquer votre nom.");
      return;
    }

    setChargement(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password: motDePasse });
    setChargement(false);

    if (error) {
      setErreur(error.message);
      return;
    }
    if (!data.session) {
      setInfo("Compte créé — confirmez votre e-mail, puis revenez sur cette page avec votre code pour rejoindre le chantier.");
      return;
    }
    setEtape("code");
  }

  async function rejoindre(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);

    if (code.trim().length === 0) {
      setErreur("Veuillez saisir un code d'invitation.");
      return;
    }
    if (nom.trim().length < 2) {
      setErreur("Veuillez indiquer votre nom.");
      return;
    }

    setChargement(true);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("rejoindre_chantier_via_code", { p_code: code.trim(), p_nom: nom.trim() });
    setChargement(false);

    if (error) {
      setErreur(mapErreurRpc(error.message));
      return;
    }

    router.push(`/chantiers/${data.chantier_id}`);
    router.refresh();
  }

  if (etape === "verification") {
    return <div className="min-h-screen bg-papier" />;
  }

  if (etape === "deja_associe") {
    return (
      <div className="relative min-h-screen overflow-hidden flex items-center justify-center bg-papier px-4">
        <IllustrationArchitecture />
        <div className="relative card w-full max-w-sm p-8">
          <EnTete />
          <p className="text-sm text-neige/50 mb-6">Rejoindre un chantier</p>
          <p className="text-sm text-neige/70">
            Ce compte est déjà associé à une entreprise — un code d&apos;invitation ne peut être utilisé qu&apos;à la création du compte.
          </p>
          <Link href="/dashboard" className="inline-block mt-6 text-rouille font-medium text-sm">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  if (etape === "code_administrateur") {
    return (
      <div className="relative min-h-screen overflow-hidden flex items-center justify-center bg-papier px-4">
        <IllustrationArchitecture />
        <form onSubmit={rejoindre} className="relative card w-full max-w-sm p-8">
          <EnTete />
          <p className="text-sm text-neige/50 mb-6">Rattacher votre entreprise à un chantier</p>

          {erreur && <div className="text-sm text-[#FF8A80] bg-[#3B1418] rounded-lg px-3 py-2 mb-4">{erreur}</div>}

          <p className="text-sm text-neige/70 mb-4">
            Saisissez le code fourni par le donneur d&apos;ordre pour rattacher votre entreprise à son chantier.
          </p>

          <label className="text-xs font-mono text-neige/60 block mb-1">CODE D'INVITATION</label>
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={8}
            className="w-full border border-ligne rounded-lg px-3 py-2 mb-6 font-mono tracking-widest uppercase"
          />

          <button type="submit" disabled={chargement} className="w-full bg-rouille text-white font-semibold rounded-lg py-2.5 disabled:opacity-60">
            {chargement ? "Validation…" : "Rattacher le chantier"}
          </button>
          <Link href="/dashboard" className="inline-block w-full text-center mt-4 text-neige/50 text-sm">
            Retour au tableau de bord
          </Link>
        </form>
      </div>
    );
  }

  if (etape === "compte") {
    return (
      <div className="relative min-h-screen overflow-hidden flex items-center justify-center bg-papier px-4 py-10">
        <IllustrationArchitecture />
        <form onSubmit={creerCompte} className="relative card w-full max-w-sm p-8">
          <EnTete />
          <p className="text-sm text-neige/50 mb-6">Rejoindre un chantier avec un code</p>

          {erreur && <div className="text-sm text-[#FF8A80] bg-[#3B1418] rounded-lg px-3 py-2 mb-4">{erreur}</div>}
          {info && (
            <div className="text-sm rounded-lg px-3 py-2 mb-4" style={{ color: "#6EE7A0", background: "rgba(110,231,160,0.12)" }}>
              {info}
            </div>
          )}

          {!info && (
            <>
              <label className="text-xs font-mono text-neige/60 block mb-1">VOTRE NOM</label>
              <input required value={nom} onChange={(e) => setNom(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2 mb-4" />

              <label className="text-xs font-mono text-neige/60 block mb-1">E-MAIL</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2 mb-4" />

              <label className="text-xs font-mono text-neige/60 block mb-1">MOT DE PASSE</label>
              <input
                type="password"
                required
                minLength={8}
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                className="w-full border border-ligne rounded-lg px-3 py-2 mb-6"
              />

              <button type="submit" disabled={chargement} className="w-full bg-rouille text-white font-semibold rounded-lg py-2.5 disabled:opacity-60">
                {chargement ? "Création…" : "Créer mon accès"}
              </button>
            </>
          )}
          <p className="text-xs text-neige/50 text-center mt-5">
            Déjà un compte ? <Link href="/login" className="text-rouille font-medium">Se connecter</Link>
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center bg-papier px-4">
      <IllustrationArchitecture />
      <form onSubmit={rejoindre} className="relative card w-full max-w-sm p-8">
        <EnTete />
        <p className="text-sm text-neige/50 mb-6">Rejoindre un chantier avec un code</p>

        {erreur && <div className="text-sm text-[#FF8A80] bg-[#3B1418] rounded-lg px-3 py-2 mb-4">{erreur}</div>}

        <label className="text-xs font-mono text-neige/60 block mb-1">VOTRE NOM</label>
        <input required value={nom} onChange={(e) => setNom(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2 mb-4" />

        <label className="text-xs font-mono text-neige/60 block mb-1">CODE D'INVITATION</label>
        <input
          required
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={8}
          className="w-full border border-ligne rounded-lg px-3 py-2 mb-6 font-mono tracking-widest uppercase"
        />

        <button type="submit" disabled={chargement} className="w-full bg-rouille text-white font-semibold rounded-lg py-2.5 disabled:opacity-60">
          {chargement ? "Validation…" : "Rejoindre le chantier"}
        </button>
      </form>
    </div>
  );
}
