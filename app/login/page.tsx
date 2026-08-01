"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
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
      setErreur("E-mail ou mot de passe incorrect.");
      return;
    }
    router.push(params.get("suivant") || "/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-papier px-4">
      <form onSubmit={seConnecter} className="card w-full max-w-sm p-8">
        <div className="flex items-center gap-2 font-display font-semibold text-lg text-ardoise mb-1">
          <span className="w-6 h-6 rounded-md bg-gradient-to-br from-rouille to-ambre inline-block" />
          DevisEtanche
        </div>
        <p className="text-sm text-ardoise/50 mb-6">Connexion à votre espace</p>

        {erreur && <div className="text-sm text-[#C64A2C] bg-[#F6E1DE] rounded-lg px-3 py-2 mb-4">{erreur}</div>}

        <label className="text-xs font-mono text-ardoise/60 block mb-1">E-MAIL</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-ligne rounded-lg px-3 py-2 mb-4"
        />
        <label className="text-xs font-mono text-ardoise/60 block mb-1">MOT DE PASSE</label>
        <input
          type="password"
          required
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          className="w-full border border-ligne rounded-lg px-3 py-2 mb-6"
        />
        <button
          type="submit"
          disabled={chargement}
          className="w-full bg-rouille text-white font-semibold rounded-lg py-2.5 disabled:opacity-60"
        >
          {chargement ? "Connexion…" : "Se connecter"}
        </button>
        <p className="text-xs text-ardoise/50 text-center mt-5">
          Pas encore de compte ? <Link href="/signup" className="text-rouille font-medium">Créer un compte</Link>
        </p>
      </form>
    </div>
  );
}
