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
      "*, chantiers(nom, ville), clients(nom, ville, email, telephone), entreprises(*)"
    )
    .eq("id", id)
    .single();

  if (!devis) {
    return <div className="p-10 text-sm text-encre/60">Devis introuvable.</div>;
  }

  const { data: facture } = await supabase.from("factures").select("id").eq("devis_id", id).maybeSingle();

  const lignes = (devis.lignes ?? []) as LigneDevis[];
  const devise = devis.entreprises?.devise ?? "XPF";
  const libelleTaxe = devis.entreprises?.libelle_taxe ?? "TGC";
  const entrepriseNom = devis.entreprises?.nom ?? "—";
  // Mentions obligatoires (supabase/migration-mentions-legales-devis.sql) — absentes tant que la migration n'est pas passée.
  const formeJuridique: string | null = devis.entreprises?.forme_juridique ?? null;
  const conditionsReglement: string | null = devis.entreprises?.conditions_reglement ?? null;
  const dateEmission = new Date(devis.created_at).toLocaleDateString("fr-FR");
  const validiteJours: number = devis.entreprises?.validite_devis_jours ?? 30;

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
          <div className="font-display font-semibold text-xl text-encre mb-1">
            {entrepriseNom}
            {formeJuridique && <span className="font-normal text-encre/60"> — {formeJuridique}</span>}
          </div>
          {devis.entreprises?.adresse && <div className="text-xs text-encre/60">{devis.entreprises.adresse}</div>}
          <div className="text-xs text-encre/60">
            {[devis.entreprises?.telephone, devis.entreprises?.email].filter(Boolean).join(" · ")}
          </div>
          {devis.entreprises?.numero_identification && (
            <div className="text-xs text-encre/60">{devis.entreprises.numero_identification}</div>
          )}
          <div className="text-xs text-encre/60 mt-2">Devis n° {devis.numero}</div>
          <div className="text-xs text-encre/60">Émis le {dateEmission}</div>
          <div className="text-xs text-encre/60">Devis valable {validiteJours} jours à compter de sa date d'émission</div>
        </div>
        <div className="text-right text-sm">
          <div className="font-medium text-encre">{devis.clients?.nom ?? "Client à définir"}</div>
          <div className="text-encre/60">{devis.clients?.ville}</div>
          {devis.clients?.email && <div className="text-encre/60 text-xs">{devis.clients.email}</div>}
          {devis.clients?.telephone && <div className="text-encre/60 text-xs">{devis.clients.telephone}</div>}
        </div>
      </div>

      <div className="mb-8 text-sm">
        <div className="text-encre/60 text-xs mb-1">CHANTIER</div>
        <div className="font-medium text-encre">{devis.chantiers?.nom} — {devis.chantiers?.ville}</div>
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
          <div className="flex justify-between py-1"><span className="text-encre/60">Total HT</span><span className="font-mono">{formatMontant(Number(devis.total_ht), devise)}</span></div>
          <div className="flex justify-between py-1"><span className="text-encre/60">{libelleTaxe} ({devis.tva_pct}%)</span><span className="font-mono">{formatMontant(Number(devis.total_ttc) - Number(devis.total_ht), devise)}</span></div>
          <div className="flex justify-between py-2 border-t border-marine mt-1 font-semibold text-encre"><span>Total TTC</span><span className="font-mono">{formatMontant(Number(devis.total_ttc), devise)}</span></div>
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
