import { createClient } from "@/lib/supabase/server";
import ImprimerButton from "@/components/ImprimerButton";
import StatutDevisForm from "./StatutDevisForm";
import type { LigneDevis } from "@/lib/types";
import { formatMontant } from "@/lib/devise";

export default async function DevisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: devis } = await supabase
    .from("devis")
    .select(
      "*, chantiers(nom, ville), clients(nom, ville, email, telephone), entreprises(nom, adresse, telephone, email, numero_identification, devise, libelle_taxe, forme_juridique, conditions_reglement, validite_devis_jours)"
    )
    .eq("id", id)
    .single();

  if (!devis) {
    return <div className="p-10 text-sm text-neige/50">Devis introuvable.</div>;
  }

  const { data: facture } = await supabase.from("factures").select("id").eq("devis_id", id).maybeSingle();

  const lignes = (devis.lignes ?? []) as LigneDevis[];
  const devise = devis.entreprises?.devise ?? "XPF";
  const libelleTaxe = devis.entreprises?.libelle_taxe ?? "TGC";
  const entrepriseNom = devis.entreprises?.nom ?? "—";
  const formeJuridique = devis.entreprises?.forme_juridique;
  const conditionsReglement = devis.entreprises?.conditions_reglement;
  const validiteJours = devis.entreprises?.validite_devis_jours ?? 30;
  const dateEmission = devis.created_at ? new Date(devis.created_at).toLocaleDateString("fr-FR") : null;

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <div className="flex justify-between items-start mb-10 print:hidden">
        <StatutDevisForm
          devisId={devis.id}
          statutActuel={devis.statut}
          factureId={facture?.id ?? null}
          entrepriseId={devis.entreprise_id}
          chantierId={devis.chantier_id}
          clientId={devis.client_id}
          lignes={lignes}
          totalHt={Number(devis.total_ht)}
          tvaPct={Number(devis.tva_pct)}
          totalTtc={Number(devis.total_ttc)}
        />
        <ImprimerButton />
      </div>

      <div className="flex justify-between items-start mb-10">
        <div>
          <div className="font-display font-semibold text-xl text-neige mb-1">
            {entrepriseNom}
            {formeJuridique && <span className="text-neige/50 font-normal"> — {formeJuridique}</span>}
          </div>
          {devis.entreprises?.adresse && <div className="text-xs text-neige/50">{devis.entreprises.adresse}</div>}
          <div className="text-xs text-neige/50">
            {[devis.entreprises?.telephone, devis.entreprises?.email].filter(Boolean).join(" · ")}
          </div>
          {devis.entreprises?.numero_identification && (
            <div className="text-xs text-neige/50">{devis.entreprises.numero_identification}</div>
          )}
          <div className="text-xs text-neige/50 mt-2">Devis n° {devis.numero}</div>
          {dateEmission && <div className="text-xs text-neige/50">Émis le {dateEmission}</div>}
          <div className="text-xs text-neige/50">Devis valable {validiteJours} jours à compter de sa date d'émission</div>
        </div>
        <div className="text-right text-sm">
          <div className="font-medium text-neige">{devis.clients?.nom ?? "Client à définir"}</div>
          <div className="text-neige/50">{devis.clients?.ville}</div>
          {devis.clients?.email && <div className="text-neige/50 text-xs">{devis.clients.email}</div>}
          {devis.clients?.telephone && <div className="text-neige/50 text-xs">{devis.clients.telephone}</div>}
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
              <td className="py-2 text-right font-mono">{formatMontant(l.prix_unitaire, devise)}</td>
              <td className="py-2 text-right font-mono">{formatMontant(l.quantite * l.prix_unitaire, devise)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-56 text-sm">
          <div className="flex justify-between py-1"><span className="text-neige/50">Total HT</span><span className="font-mono">{formatMontant(Number(devis.total_ht), devise)}</span></div>
          <div className="flex justify-between py-1"><span className="text-neige/50">{libelleTaxe} ({devis.tva_pct}%)</span><span className="font-mono">{formatMontant(Number(devis.total_ttc) - Number(devis.total_ht), devise)}</span></div>
          <div className="flex justify-between py-2 border-t border-ardoise mt-1 font-semibold text-neige"><span>Total TTC</span><span className="font-mono">{formatMontant(Number(devis.total_ttc), devise)}</span></div>
        </div>
      </div>

      {conditionsReglement && (
        <div className="mt-10 pt-4 border-t border-ligne text-xs text-neige/50">
          <span className="font-medium text-neige/70">Conditions de règlement — </span>
          {conditionsReglement}
        </div>
      )}
    </div>
  );
}
