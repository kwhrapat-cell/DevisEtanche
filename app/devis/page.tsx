import Link from "next/link";
import TopBar from "@/components/TopBar";
import { getUtilisateurCourant } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { formatMontant } from "@/lib/devise";
import { StatusBadge } from "@/components/ui/StatusBadge";

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
        <div className="p-4 sm:p-8">
          <div className="mb-5">
            <Link href="/devis/nouveau" className="inline-flex items-center gap-2 bg-primaire text-white text-sm font-semibold px-4 py-2 rounded-lg">
              + Nouveau devis
            </Link>
          </div>
          {!devisListe || devisListe.length === 0 ? (
            <div className="card p-10 text-center">
              <div className="font-display font-semibold text-encre mb-2">Aucun devis pour l'instant</div>
              <p className="text-sm text-encre/60">Créez un devis pour l'un de vos chantiers.</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-encre/60 border-b border-ligne">
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
                        <Link href={`/devis/${d.id}`} className="hover:text-primaire">{d.numero}</Link>
                      </td>
                      <td className="px-5 py-4 font-medium text-encre">{d.chantiers?.nom ?? "—"}</td>
                      <td className="px-5 py-4 font-mono">{formatMontant(Number(d.total_ttc), session?.entreprise?.devise)}</td>
                      <td className="px-5 py-4">
                        <StatusBadge domaine="devis" statut={d.statut} />
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
