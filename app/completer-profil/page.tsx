"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import IllustrationArchitecture from "@/components/IllustrationArchitecture";

export default function CompleterProfilPage() {
  const [nom, setNom] = useState("");
  const [entreprise, setEntreprise] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);
  const router = useRouter();

  async function completer(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setChargement(true);
    const supabase = createClient();

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setChargement(false);
      router.push("/login");
      return;
    }

    const { error: rpcError } = await supabase.rpc("creer_entreprise_et_profil", {
      p_nom_entreprise: entreprise,
      p_nom_utilisateur: nom,
    });

    setChargement(false);
    if (rpcError) {
      // Un profil existe déjà (ex. double soumission après un retour arrière) :
      // le compte est en réalité déjà configuré, pas besoin de bloquer l'utilisateur.
      if (rpcError.message.toLowerCase().includes("existe déjà")) {
        router.push("/dashboard");
        router.refresh();
        return;
      }
      setErreur(
        rpcError.message.toLowerCase().includes("does not exist")
          ? "La fonction de création n'existe pas encore côté base — exécutez supabase/fix-creation-entreprise.sql dans l'éditeur SQL Supabase, puis réessayez."
          : rpcError.message
      );
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center bg-papier px-4 py-10">
      <IllustrationArchitecture />
      <form onSubmit={completer} className="relative card w-full max-w-sm p-8">
        <div className="flex items-center gap-2 font-display font-semibold text-lg text-neige mb-1">
          <span className="w-6 h-6 rounded-md bg-gradient-to-br from-rouille to-ambre inline-block" />
          DevisEtanche
        </div>
        <p className="text-sm text-neige/50 mb-6">
          Votre compte est connecté mais aucune entreprise n'y est encore associée — complétez ces deux champs pour continuer.
        </p>

        {erreur && <div className="text-sm text-[#FF8A80] bg-[#3B1418] rounded-lg px-3 py-2 mb-4">{erreur}</div>}

        <label className="text-xs font-mono text-neige/60 block mb-1">VOTRE NOM</label>
        <input required value={nom} onChange={(e) => setNom(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2 mb-4" />

        <label className="text-xs font-mono text-neige/60 block mb-1">NOM DE L'ENTREPRISE</label>
        <input required value={entreprise} onChange={(e) => setEntreprise(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2 mb-6" />

        <button type="submit" disabled={chargement} className="w-full bg-rouille text-white font-semibold rounded-lg py-2.5 disabled:opacity-60">
          {chargement ? "Enregistrement…" : "Continuer"}
        </button>
      </form>
    </div>
  );
}
