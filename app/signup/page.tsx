"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [nom, setNom] = useState("");
  const [entreprise, setEntreprise] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);
  const router = useRouter();

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

    // Crée l'entreprise puis le profil lié — voir supabase/schema.sql pour les policies RLS.
    const { data: entrepriseData, error: entrepriseError } = await supabase
      .from("entreprises")
      .insert({ nom: entreprise })
      .select()
      .single();

    if (entrepriseError) {
      setChargement(false);
      setErreur(entrepriseError.message);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      entreprise_id: entrepriseData.id,
      nom,
      role: "administrateur",
    });

    setChargement(false);
    if (profileError) {
      setErreur("Compte créé, mais le profil n'a pas pu être enregistré. Contactez le support.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-papier px-4">
      <form onSubmit={creerCompte} className="card w-full max-w-sm p-8">
        <div className="flex items-center gap-2 font-display font-semibold text-lg text-ardoise mb-1">
          <span className="w-6 h-6 rounded-md bg-gradient-to-br from-rouille to-ambre inline-block" />
          DevisEtanche
        </div>
        <p className="text-sm text-ardoise/50 mb-6">Créer votre espace</p>

        {erreur && <div className="text-sm text-[#C64A2C] bg-[#F6E1DE] rounded-lg px-3 py-2 mb-4">{erreur}</div>}

        <label className="text-xs font-mono text-ardoise/60 block mb-1">VOTRE NOM</label>
        <input required value={nom} onChange={(e) => setNom(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2 mb-4" />

        <label className="text-xs font-mono text-ardoise/60 block mb-1">NOM DE L'ENTREPRISE</label>
        <input required value={entreprise} onChange={(e) => setEntreprise(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2 mb-4" />

        <label className="text-xs font-mono text-ardoise/60 block mb-1">E-MAIL</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2 mb-4" />

        <label className="text-xs font-mono text-ardoise/60 block mb-1">MOT DE PASSE</label>
        <input type="password" required minLength={6} value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2 mb-6" />

        <button type="submit" disabled={chargement} className="w-full bg-rouille text-white font-semibold rounded-lg py-2.5 disabled:opacity-60">
          {chargement ? "Création…" : "Créer mon compte"}
        </button>
        <p className="text-xs text-ardoise/50 text-center mt-5">
          Déjà un compte ? <Link href="/login" className="text-rouille font-medium">Se connecter</Link>
        </p>
      </form>
    </div>
  );
}
