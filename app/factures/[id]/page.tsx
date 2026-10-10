import { createClient } from "@/lib/supabase/server";
import ImprimerButton from "@/components/ImprimerButton";
import StatutFactureForm from "../StatutFactureForm";
import type { LigneDevis } from "@/lib/types";
import { formatMontant } from "@/lib/devise";

export default async function FactureDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: facture } = await supabase
    .from("factures")
    .select(
      "*, chantiers(nom, ville), clients(nom, ville, email, telephone), entreprises(*)"
    )
    .eq("id", id)
    .single();

  if (!facture) {
    return <div className="p-10 text-sm text-encre/60">Facture introuvable.</div>;
  }

  const lignes = (facture.lignes ?? []) as LigneDevis[];
  const devise = facture.entreprises?.devise ?? "XPF";
  const libelleTaxe = facture.entreprises?.libelle_taxe ?? "TGC";
  const entrepriseNom = facture.entreprises?.nom ?? "—";
  // Mentions obligatoires (supabase/migration-mentions-legales-devis.sql) — absentes tant que la migration n'est pas passée.
  const formeJuridique: string | null = facture.entreprises?.forme_juridique ?? null;
  const conditionsReglement: string | null = facture.entreprises?.conditions_reglement ?? null;
  const dateEmission = new Date(facture.created_at).toLocaleDateString("fr-FR");

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <div className="flex justify-between items-start mb-10 print:hidden">
        <StatutFactureForm factureId={facture.id} statutActuel={facture.statut} />
        <ImprimerButton />
      </div>

      <div className="flex justify-between items-start mb-10">
        <div>
          <div className="font-display font-semibold text-xl text-encre mb-1">
            {entrepriseNom}
            {formeJuridique && <span className="font-normal text-encre/60"> — {formeJuridique}</span>}
          </div>
          {facture.entreprises?.adresse && <div className="text-xs text-encre/60">{facture.entreprises.adresse}</div>}
          <div className="text-xs text-encre/60">
            {[facture.entreprises?.telephone, facture.entreprises?.email].filter(Boolean).join(" · ")}
          </div>
          {facture.entreprises?.numero_identification && (
            <div className="text-xs text-encre/60">{facture.entreprises.numero_identification}</div>
          )}
          <div className="text-xs text-encre/60 mt-2">Facture n° {facture.numero}</div>
          <div className="text-xs text-encre/60">Émise le {dateEmission}</div>
          {facture.date_echeance && <div className="text-xs text-encre/60">Échéance : {facture.date_echeance}</div>}
        </div>
        <div className="text-right text-sm">
          <div className="font-medium text-encre">{facture.clients?.nom ?? "Client à définir"}</div>
          <div className="text-encre/60">{facture.clients?.ville}</div>
          {facture.clients?.email && <div className="text-encre/60 text-xs">{facture.clients.email}</div>}
          {facture.clients?.telephone && <div className="text-encre/60 text-xs">{facture.clients.telephone}</div>}
        </div>
      </div>

      <div className="mb-8 text-sm">
        <div className="text-encre/60 text-xs mb-1">CHANTIER</div>
        <div className="font-medium text-encre">{facture.chantiers?.nom} — {facture.chantiers?.ville}</div>
      </div>

      <table className="w-full text-sm mb-8">
        <thead>
          <tr className="text-left text-xs text-encre/60 border-b border-ligne">
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
              <td className="py-2 text-right font-mono">{formatMontant(l.prix_unitaire, devise)}</td>
              <td className="py-2 text-right font-mono">{formatMontant(l.quantite * l.prix_unitaire, devise)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-56 text-sm">
          <div className="flex justify-between py-1"><span className="text-encre/60">Total HT</span><span className="font-mono">{formatMontant(Number(facture.total_ht), devise)}</span></div>
          <div className="flex justify-between py-1"><span className="text-encre/60">{libelleTaxe} ({facture.tva_pct}%)</span><span className="font-mono">{formatMontant(Number(facture.total_ttc) - Number(facture.total_ht), devise)}</span></div>
          <div className="flex justify-between py-2 border-t border-marine mt-1 font-semibold text-encre"><span>Total TTC</span><span className="font-mono">{formatMontant(Number(facture.total_ttc), devise)}</span></div>
        </div>
      </div>

      {conditionsReglement && (
        <div className="mt-10 border-t border-ligne pt-4 text-xs text-encre/60">
          <span className="font-medium text-encre/80">Conditions de règlement — </span>
          {conditionsReglement}
        </div>
      )}
    </div>
  );
}
