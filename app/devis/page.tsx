import Link from "next/link";
import TopBar from "@/components/TopBar";
import { getUtilisateurCourant } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

const styleStatut: Record<string, string> = {
  brouillon: "bg-sable text-neige/60",
  envoye: "bg-[#1B2C4E] text-[#8FB4FF]",
  accepte: "bg-[#123024] text-vert",
  refuse: "bg-[#3B1418] text-[#FF8A80]",
};

export default async function DevisPage() {
  const session = await getUtilisateurCourant();
  const supabase = await createClient();

  const { data: devisListe } = session?.profile
    ? await supabase
        .from("devis")
        .select("id, numero, statut, total_ttc, chantiers(nom)")
        .eq("entreprise_id", session.profile.entreprise_id)
        .order("created_at", { ascending: false })
    : { data: null };

  return (
    <>
        <TopBar titre="Devis" sousTitre="Générés depuis le calculateur ou saisis manuellement" />
        <div className="p-8">
          <div className="mb-5">
            <Link href="/devis/nouveau" className="inline-flex items-center gap-2 bg-rouille text-white text-sm font-semibold px-4 py-2 rounded-lg">
              + Nouveau devis
            </Link>
          </div>
          {!devisListe || devisListe.length === 0 ? (
            <div className="card p-10 text-center">
              <div className="font-display font-semibold text-neige mb-2">Aucun devis pour l'instant</div>
              <p className="text-sm text-neige/50">Créez un devis pour l'un de vos chantiers.</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-neige/50 border-b border-ligne">
                    <th className="px-5 py-3 font-medium">N°</th>
                    <th className="px-5 py-3 font-medium">Chantier</th>
                    <th className="px-5 py-3 font-medium">Montant TTC</th>
                    <th className="px-5 py-3 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {devisListe.map((d: any) => (
                    <tr key={d.id} className="border-b border-ligne last:border-0 hover:bg-sable/40">
                      <td className="px-5 py-4 font-mono text-xs">
                        <Link href={`/devis/${d.id}`} className="hover:text-rouille">{d.numero}</Link>
                      </td>
                      <td className="px-5 py-4 font-medium text-neige">{d.chantiers?.nom ?? "—"}</td>
                      <td className="px-5 py-4 font-mono">{Number(d.total_ttc).toLocaleString("fr-FR")} €</td>
                      <td className="px-5 py-4">
                        <span className={`badge ${styleStatut[d.statut]}`}>{d.statut}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
    </>
  );
}
