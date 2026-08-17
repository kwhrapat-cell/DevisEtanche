import { createClient } from "@/lib/supabase/server";
import ImprimerButton from "./ImprimerButton";
import type { LigneDevis } from "@/lib/types";

export default async function DevisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: devis } = await supabase
    .from("devis")
    .select("*, chantiers(nom, ville), clients(nom, ville)")
    .eq("id", id)
    .single();

  if (!devis) {
    return <div className="p-10 text-sm text-neige/50">Devis introuvable.</div>;
  }

  const lignes = (devis.lignes ?? []) as LigneDevis[];

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <div className="flex justify-between items-start mb-10 print:hidden">
        <div />
        <ImprimerButton />
      </div>

      <div className="flex justify-between items-start mb-10">
        <div>
          <div className="font-display font-semibold text-xl text-neige mb-1">DevisEtanche</div>
          <div className="text-xs text-neige/50">Devis n° {devis.numero}</div>
        </div>
        <div className="text-right text-sm">
          <div className="font-medium text-neige">{devis.clients?.nom ?? "Client à définir"}</div>
          <div className="text-neige/50">{devis.clients?.ville}</div>
        </div>
      </div>

      <div className="mb-8 text-sm">
        <div className="text-neige/50 text-xs mb-1">CHANTIER</div>
        <div className="font-medium text-neige">{devis.chantiers?.nom} — {devis.chantiers?.ville}</div>
      </div>

      <table className="w-full text-sm mb-8">
        <thead>
          <tr className="text-left text-xs text-neige/50 border-b border-ligne">
            <th className="py-2">Désignation</th>
            <th className="py-2 text-right">Qté</th>
            <th className="py-2 text-right">Unité</th>
            <th className="py-2 text-right">Prix U.</th>
            <th className="py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {lignes.map((l, i) => (
            <tr key={i} className="border-b border-ligne">
              <td className="py-2">{l.designation}</td>
              <td className="py-2 text-right font-mono">{l.quantite}</td>
              <td className="py-2 text-right">{l.unite}</td>
              <td className="py-2 text-right font-mono">{l.prix_unitaire.toFixed(2)} €</td>
              <td className="py-2 text-right font-mono">{(l.quantite * l.prix_unitaire).toFixed(2)} €</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-56 text-sm">
          <div className="flex justify-between py-1"><span className="text-neige/50">Total HT</span><span className="font-mono">{Number(devis.total_ht).toFixed(2)} €</span></div>
          <div className="flex justify-between py-1"><span className="text-neige/50">TVA ({devis.tva_pct}%)</span><span className="font-mono">{(Number(devis.total_ttc) - Number(devis.total_ht)).toFixed(2)} €</span></div>
          <div className="flex justify-between py-2 border-t border-ardoise mt-1 font-semibold text-neige"><span>Total TTC</span><span className="font-mono">{Number(devis.total_ttc).toFixed(2)} €</span></div>
        </div>
      </div>
    </div>
  );
}
