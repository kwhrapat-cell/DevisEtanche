"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import IllustrationArchitecture from "@/components/IllustrationArchitecture";
import Logo from "@/components/Logo";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Etape = "verification" | "deja_associe" | "compte" | "code";

function EnTete() {
  return (
    <div className="flex items-center gap-2 font-display font-semibold text-lg text-encre mb-1">
      <Logo avecNom={false} />
      DevisEtanche
    </div>
  );
}

function mapErreurRpc(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("trop de tentatives")) return "Trop de tentatives — réessayez dans quelques minutes.";
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
      const { data: profile } = await supabase.from("profiles").select("id").eq("id", userData.user.id).single();
      setEtape(profile ? "deja_associe" : "code");
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
    return <div className="min-h-screen bg-fond" />;
  }

  if (etape === "deja_associe") {
    return (
      <div className="relative min-h-screen overflow-hidden flex items-center justify-center bg-fond px-4">
        <IllustrationArchitecture />
        <div className="relative card w-full max-w-sm p-8">
          <EnTete />
          <p className="text-sm text-encre/60 mb-6">Rejoindre un chantier</p>
          <p className="text-sm text-encre/80">
            Ce compte est déjà associé à une entreprise — un code d&apos;invitation ne peut être utilisé qu&apos;à la création du compte.
          </p>
          <Link href="/dashboard" className="inline-block mt-6 text-primaire font-medium text-sm">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  if (etape === "compte") {
    return (
      <div className="relative min-h-screen overflow-hidden flex items-center justify-center bg-fond px-4 py-10">
        <IllustrationArchitecture />
        <form onSubmit={creerCompte} className="relative card w-full max-w-sm p-8">
          <EnTete />
          <p className="text-sm text-encre/60 mb-6">Rejoindre un chantier avec un code</p>

          {erreur && <div className="text-sm text-rouge bg-rouge/10 rounded-lg px-3 py-2 mb-4">{erreur}</div>}
          {info && (
            <div className="text-sm rounded-lg px-3 py-2 mb-4 bg-emerald-50 text-emerald-700">
              {info}
            </div>
          )}

          {!info && (
            <>
              <label className="text-xs font-mono text-encre/70 block mb-1">VOTRE NOM</label>
              <input required value={nom} onChange={(e) => setNom(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2 mb-4" />

              <label className="text-xs font-mono text-encre/70 block mb-1">E-MAIL</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2 mb-4" />

              <label className="text-xs font-mono text-encre/70 block mb-1">MOT DE PASSE</label>
              <input
                type="password"
                required
                minLength={8}
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                className="w-full border border-ligne rounded-lg px-3 py-2 mb-6"
              />

              <button type="submit" disabled={chargement} className="w-full bg-primaire text-white font-semibold rounded-lg py-2.5 disabled:opacity-60">
                {chargement ? "Création…" : "Créer mon accès"}
              </button>
            </>
          )}
          <p className="text-xs text-encre/60 text-center mt-5">
            Déjà un compte ? <Link href="/login" className="text-primaire font-medium">Se connecter</Link>
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center bg-fond px-4">
      <IllustrationArchitecture />
      <form onSubmit={rejoindre} className="relative card w-full max-w-sm p-8">
        <EnTete />
        <p className="text-sm text-encre/60 mb-6">Rejoindre un chantier avec un code</p>

        {erreur && <div className="text-sm text-rouge bg-rouge/10 rounded-lg px-3 py-2 mb-4">{erreur}</div>}

        <label className="text-xs font-mono text-encre/70 block mb-1">VOTRE NOM</label>
        <input required value={nom} onChange={(e) => setNom(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2 mb-4" />

        <label className="text-xs font-mono text-encre/70 block mb-1">CODE D'INVITATION</label>
        <input
          required
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={8}
          className="w-full border border-ligne rounded-lg px-3 py-2 mb-6 font-mono tracking-widest uppercase"
        />

        <button type="submit" disabled={chargement} className="w-full bg-primaire text-white font-semibold rounded-lg py-2.5 disabled:opacity-60">
          {chargement ? "Validation…" : "Rejoindre le chantier"}
        </button>
      </form>
    </div>
  );
}
