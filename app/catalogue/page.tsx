import TopBar from "@/components/TopBar";
import { createClient } from "@/lib/supabase/server";
import type { ProduitEtancheite } from "@/lib/types";
import CatalogueListe from "./CatalogueListe";

export default async function CataloguePage() {
  const supabase = await createClient();
  const { data: produits } = await supabase
    .from("produits_etancheite")
    .select("*")
    .order("fabricant")
    .order("nom");

  return (
    <>
        <TopBar
          titre="Catalogue produits"
          sousTitre={`${produits?.length ?? 0} produits — Soprema, Sika, Axter`}
        />
        <div className="p-8">
          {!produits || produits.length === 0 ? (
            <div className="card p-10 text-center">
              <div className="font-display font-semibold text-neige mb-2">Catalogue vide</div>
              <p className="text-sm text-neige/50 max-w-md mx-auto">
                Exécutez <code className="font-mono">supabase/produits-etancheite.sql</code> dans l'éditeur
                SQL de votre projet Supabase pour charger le catalogue de référence.
              </p>
            </div>
          ) : (
            <CatalogueListe produits={produits as ProduitEtancheite[]} />
          )}
        </div>
    </>
  );
}
