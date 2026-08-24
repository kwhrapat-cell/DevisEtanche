"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import IllustrationArchitecture from "@/components/IllustrationArchitecture";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);
  const [envoye, setEnvoye] = useState(false);

  async function envoyerLien(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);

    if (!EMAIL_RE.test(email)) {
      setErreur("Veuillez saisir une adresse e-mail valide.");
      return;
    }

    setChargement(true);
    const supabase = createClient();
    const origine = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origine}/reinitialiser-mot-de-passe`,
    });
    setChargement(false);

    if (error) {
      setErreur(error.message || "Impossible d'envoyer l'e-mail de réinitialisation. Réessayez plus tard.");
      return;
    }

    setEnvoye(true);
  }

  if (envoye) {
    return (
      <div className="relative min-h-screen overflow-hidden flex items-center justify-center bg-papier px-4">
        <IllustrationArchitecture />
        <div className="relative card w-full max-w-sm p-8 text-center">
          <div className="flex items-center justify-center gap-2 font-display font-semibold text-lg text-neige mb-1">
            <span className="w-6 h-6 rounded-md bg-gradient-to-br from-rouille to-ambre inline-block" />
            DevisEtanche
          </div>
          <p className="text-sm text-neige/70 mt-4">
            Si un compte existe pour <span className="text-neige">{email}</span>, un e-mail contenant un lien de réinitialisation vient de vous être envoyé.
          </p>
          <p className="text-xs text-neige/50 mt-4">Pensez à vérifier vos courriers indésirables si vous ne le voyez pas rapidement.</p>
          <Link href="/login" className="inline-block mt-6 text-rouille font-medium text-sm">
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center bg-papier px-4">
      <IllustrationArchitecture />
      <form onSubmit={envoyerLien} className="relative card w-full max-w-sm p-8">
        <div className="flex items-center gap-2 font-display font-semibold text-lg text-neige mb-1">
          <span className="w-6 h-6 rounded-md bg-gradient-to-br from-rouille to-ambre inline-block" />
          DevisEtanche
        </div>
        <p className="text-sm text-neige/50 mb-6">Mot de passe oublié</p>

        {erreur && <div className="text-sm text-[#FF8A80] bg-[#3B1418] rounded-lg px-3 py-2 mb-4">{erreur}</div>}

        <p className="text-xs text-neige/50 mb-4">
          Saisissez l&apos;adresse e-mail de votre compte : nous vous enverrons un lien pour choisir un nouveau mot de passe.
        </p>

        <label className="text-xs font-mono text-neige/60 block mb-1">E-MAIL</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-ligne rounded-lg px-3 py-2 mb-6"
        />

        <button
          type="submit"
          disabled={chargement}
          className="w-full bg-rouille text-white font-semibold rounded-lg py-2.5 disabled:opacity-60"
        >
          {chargement ? "Envoi…" : "Envoyer le lien de réinitialisation"}
        </button>
        <p className="text-xs text-neige/50 text-center mt-5">
          <Link href="/login" className="text-rouille font-medium">Retour à la connexion</Link>
        </p>
      </form>
    </div>
  );
}
