"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

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

function LoginForm() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [motDePasseVisible, setMotDePasseVisible] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  async function seConnecter(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setChargement(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: motDePasse });
    setChargement(false);
    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        setErreur("E-mail non confirmé — vérifiez votre boîte mail, ou contactez l'administrateur si la confirmation reste bloquée.");
      } else if (error.message.toLowerCase().includes("invalid login credentials")) {
        setErreur("E-mail ou mot de passe incorrect.");
      } else {
        setErreur(error.message);
      }
      return;
    }
    router.push(params.get("suivant") || "/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-papier px-4">
      <form onSubmit={seConnecter} className="card w-full max-w-sm p-8">
        <div className="flex items-center gap-2 font-display font-semibold text-lg text-neige mb-1">
          <span className="w-6 h-6 rounded-md bg-gradient-to-br from-rouille to-ambre inline-block" />
          DevisEtanche
        </div>
        <p className="text-sm text-neige/50 mb-6">Connexion à votre espace</p>

        {erreur && <div className="text-sm text-[#FF8A80] bg-[#3B1418] rounded-lg px-3 py-2 mb-4">{erreur}</div>}

        <label className="text-xs font-mono text-neige/60 block mb-1">E-MAIL</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-ligne rounded-lg px-3 py-2 mb-4"
        />
        <label className="text-xs font-mono text-neige/60 block mb-1">MOT DE PASSE</label>
        <div className="relative mb-6">
          <input
            type={motDePasseVisible ? "text" : "password"}
            required
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
        <button
          type="submit"
          disabled={chargement}
          className="w-full bg-rouille text-white font-semibold rounded-lg py-2.5 disabled:opacity-60"
        >
          {chargement ? "Connexion…" : "Se connecter"}
        </button>
        <p className="text-xs text-neige/50 text-center mt-5">
          Pas encore de compte ? <Link href="/signup" className="text-rouille font-medium">Créer un compte</Link>
        </p>
      </form>
    </div>
  );
}
export default function LoginFormWrapper() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}