"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import { createClient } from "@/lib/supabase/client";

export default function NouveauChantierPortefeuillePage() {
  const [nom, setNom] = useState("");
  const [ville, setVille] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);
  const router = useRouter();

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setChargement(true);
    const supabase = createClient();

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setChargement(false);
      setErreur("Session expirée — reconnectez-vous.");
      return;
    }

    // Chantier minimal : ni devis ni entreprise exécutante à ce stade —
    // entreprise_id reste null jusqu'à ce qu'une entreprise rejoigne via le
    // code généré depuis /portefeuille/code (voir rejoindre_chantier_via_code).
    const { data: chantier, error } = await supabase
      .from("chantiers")
      .insert({
        donneur_ordre_id: userData.user.id,
        entreprise_id: null,
        nom,
        ville,
        statut: "en_preparation",
        avancement_pct: 0,
      })
      .select()
      .single();

    setChargement(false);
    if (error || !chantier) {
      setErreur("Le chantier n'a pas pu être créé.");
      return;
    }
    router.push("/portefeuille");
    router.refresh();
  }

  return (
    <>
      <TopBar titre="Nouveau chantier" sousTitre="Créez un chantier à confier à une entreprise exécutante" />
      <div className="p-4 sm:p-8 max-w-lg">
        <form onSubmit={enregistrer} className="card p-6 flex flex-col gap-4">
          {erreur && <div className="text-sm text-[#FF8A80] bg-[#3B1418] rounded-lg px-3 py-2">{erreur}</div>}

          <div>
            <label className="text-xs font-mono text-neige/60 block mb-1">NOM DU CHANTIER</label>
            <input required value={nom} onChange={(e) => setNom(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="text-xs font-mono text-neige/60 block mb-1">VILLE</label>
            <input value={ville} onChange={(e) => setVille(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2" />
          </div>
          <p className="text-xs text-neige/40">
            Vous pourrez générer un code de rattachement pour l&apos;entreprise exécutante juste après.
          </p>
          <button disabled={chargement} className="bg-rouille text-white font-semibold rounded-lg py-2.5 disabled:opacity-60">
            {chargement ? "Création…" : "Créer le chantier"}
          </button>
        </form>
      </div>
    </>
  );
}
