"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import IllustrationArchitecture from "@/components/IllustrationArchitecture";

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

function EnTete() {
  return (
    <div className="flex items-center gap-2 font-display font-semibold text-lg text-neige mb-1">
      <span className="w-6 h-6 rounded-md bg-gradient-to-br from-rouille to-ambre inline-block" />
      DevisEtanche
    </div>
  );
}

function ReinitialiserMotDePasseForm() {
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [motDePasseVisible, setMotDePasseVisible] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);
  const [verificationEnCours, setVerificationEnCours] = useState(true);
  const [lienValide, setLienValide] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setLienValide(true);
        setVerificationEnCours(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setLienValide(true);
      setVerificationEnCours(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function reinitialiser(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);

    if (motDePasse.length < 8) {
      setErreur("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (motDePasse !== confirmation) {
      setErreur("Les mots de passe ne correspondent pas.");
      return;
    }

    setChargement(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: motDePasse });
    setChargement(false);

    if (error) {
      if (error.message.toLowerCase().includes("session")) {
        setErreur("Votre lien de réinitialisation a expiré. Demandez un nouveau lien.");
        setLienValide(false);
      } else {
        setErreur(error.message);
      }
      return;
    }

    router.push(`/login?message=${encodeURIComponent("Votre mot de passe a été mis à jour. Vous pouvez vous connecter.")}`);
  }

  if (verificationEnCours) {
    return (
      <div className="relative min-h-screen overflow-hidden flex items-center justify-center bg-papier px-4">
        <IllustrationArchitecture />
        <div className="relative card w-full max-w-sm p-8 text-center">
          <EnTete />
          <p className="text-sm text-neige/50 mt-6">Vérification du lien…</p>
        </div>
      </div>
    );
  }

  if (!lienValide) {
    return (
      <div className="relative min-h-screen overflow-hidden flex items-center justify-center bg-papier px-4">
        <IllustrationArchitecture />
        <div className="relative card w-full max-w-sm p-8">
          <EnTete />
          <p className="text-sm text-neige/50 mb-6">Réinitialiser votre mot de passe</p>
          <div className="text-sm text-[#FF8A80] bg-[#3B1418] rounded-lg px-3 py-2 mb-4">
            Ce lien de réinitialisation est invalide ou a expiré.
          </div>
          <Link href="/mot-de-passe-oublie" className="inline-block text-rouille font-medium text-sm">
            Demander un nouveau lien
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center bg-papier px-4">
      <IllustrationArchitecture />
      <form onSubmit={reinitialiser} className="relative card w-full max-w-sm p-8">
        <EnTete />
        <p className="text-sm text-neige/50 mb-6">Choisissez un nouveau mot de passe</p>

        {erreur && <div className="text-sm text-[#FF8A80] bg-[#3B1418] rounded-lg px-3 py-2 mb-4">{erreur}</div>}

        <label className="text-xs font-mono text-neige/60 block mb-1">NOUVEAU MOT DE PASSE</label>
        <div className="relative mb-4">
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

        <label className="text-xs font-mono text-neige/60 block mb-1">CONFIRMER LE MOT DE PASSE</label>
        <div className="relative mb-6">
          <input
            type={motDePasseVisible ? "text" : "password"}
            required
            minLength={8}
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            className="w-full border border-ligne rounded-lg px-3 py-2 pr-9"
          />
        </div>

        <button
          type="submit"
          disabled={chargement}
          className="w-full bg-rouille text-white font-semibold rounded-lg py-2.5 disabled:opacity-60"
        >
          {chargement ? "Mise à jour…" : "Mettre à jour le mot de passe"}
        </button>
      </form>
    </div>
  );
}

export default function ReinitialiserMotDePassePage() {
  return (
    <Suspense fallback={null}>
      <ReinitialiserMotDePasseForm />
    </Suspense>
  );
}
