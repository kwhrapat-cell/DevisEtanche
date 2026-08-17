import Link from "next/link";
import TopBar from "@/components/TopBar";
import { getUtilisateurCourant } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { formatMontant } from "@/lib/devise";

const styleStatut: Record<string, string> = {
  a_payer: "bg-[#1B2C4E] text-[#8FB4FF]",
  payee: "bg-[#123024] text-vert",
  annulee: "bg-[#3B1418] text-[#FF8A80]",
};

const labelStatut: Record<string, string> = {
  a_payer: "à payer",
  payee: "payée",
  annulee: "annulée",
};

export default async function FacturesPage() {
  const session = await getUtilisateurCourant();
  const supabase = await createClient();

  const { data: facturesListe } = session?.profile
    ? await supabase
        .from("factures")
        .select("id, numero, statut, total_ttc, date_echeance, chantiers(nom)")
        .eq("entreprise_id", session.profile.entreprise_id)
        .order("created_at", { ascending: false })
    : { data: null };

  return (
    <>
      <TopBar titre="Factures" sousTitre="Générées à partir des devis acceptés" />
      <div className="p-4 sm:p-8">
        {!facturesListe || facturesListe.length === 0 ? (
          <div className="card p-10 text-center">
            <div className="font-display font-semibold text-neige mb-2">Aucune facture pour l'instant</div>
            <p className="text-sm text-neige/50">Marquez un devis « Accepté » puis générez sa facture.</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-neige/50 border-b border-ligne">
                    <th className="px-5 py-3 font-medium">N°</th>
                    <th className="px-5 py-3 font-medium">Chantier</th>
                    <th className="px-5 py-3 font-medium">Échéance</th>
                    <th className="px-5 py-3 font-medium">Montant TTC</th>
                    <th className="px-5 py-3 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {facturesListe.map((f: any) => (
                    <tr key={f.id} className="border-b border-ligne last:border-0 hover:bg-sable/40">
                      <td className="px-5 py-4 font-mono text-xs">
                        <Link href={`/factures/${f.id}`} className="hover:text-rouille">{f.numero}</Link>
                      </td>
                      <td className="px-5 py-4 font-medium text-neige">{f.chantiers?.nom ?? "—"}</td>
                      <td className="px-5 py-4 text-neige/60">{f.date_echeance ?? "—"}</td>
                      <td className="px-5 py-4 font-mono">{formatMontant(Number(f.total_ttc), session?.entreprise?.devise)}</td>
                      <td className="px-5 py-4">
                        <span className={`badge ${styleStatut[f.statut]}`}>{labelStatut[f.statut] ?? f.statut}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
