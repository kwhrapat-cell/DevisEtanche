"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CoordonneesForm({
  entrepriseId,
  nom: nomInitial,
  adresse: adresseInitiale,
  telephone: telephoneInitial,
  email: emailInitial,
  numeroIdentification: numeroInitial,
  formeJuridique: formeJuridiqueInitiale,
  conditionsReglement: conditionsReglementInitiales,
  validiteDevisJours: validiteDevisJoursInitiale,
}: {
  entrepriseId: string;
  nom: string;
  adresse: string | null;
  telephone: string | null;
  email: string | null;
  numeroIdentification: string | null;
  formeJuridique: string | null;
  conditionsReglement: string | null;
  validiteDevisJours: number;
}) {
  const [nom, setNom] = useState(nomInitial);
  const [adresse, setAdresse] = useState(adresseInitiale ?? "");
  const [telephone, setTelephone] = useState(telephoneInitial ?? "");
  const [email, setEmail] = useState(emailInitial ?? "");
  const [numeroIdentification, setNumeroIdentification] = useState(numeroInitial ?? "");
  const [formeJuridique, setFormeJuridique] = useState(formeJuridiqueInitiale ?? "");
  const [conditionsReglement, setConditionsReglement] = useState(conditionsReglementInitiales ?? "");
  const [validiteDevisJours, setValiditeDevisJours] = useState(validiteDevisJoursInitiale ?? 30);
  const [chargement, setChargement] = useState(false);
  const [enregistre, setEnregistre] = useState(false);
  const router = useRouter();

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setChargement(true);
    setEnregistre(false);
    const supabase = createClient();
    const { error } = await supabase
      .from("entreprises")
      .update({
        nom,
        adresse,
        telephone,
        email,
        numero_identification: numeroIdentification,
        forme_juridique: formeJuridique,
        conditions_reglement: conditionsReglement,
        validite_devis_jours: validiteDevisJours,
      })
      .eq("id", entrepriseId);
    setChargement(false);
    if (!error) {
      setEnregistre(true);
      router.refresh();
    }
  }

  return (
    <form onSubmit={enregistrer} className="card p-5">
      <div className="font-medium text-neige mb-1">Coordonnées de l'entreprise</div>
      <p className="text-xs text-neige/50 mb-3">Affichées sur vos devis et factures exportés, à la place du nom de l'application.</p>

      <div className="flex flex-col gap-3">
        <div>
          <label className="text-xs font-mono text-neige/60 block mb-1">RAISON SOCIALE</label>
          <input value={nom} onChange={(e) => setNom(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-mono text-neige/60 block mb-1">FORME JURIDIQUE</label>
          <input
            value={formeJuridique}
            onChange={(e) => setFormeJuridique(e.target.value)}
            className="w-full border border-ligne rounded-lg px-3 py-2 text-sm"
            placeholder="Ex. Entreprise individuelle, SARL, EURL…"
          />
        </div>
        <div>
          <label className="text-xs font-mono text-neige/60 block mb-1">ADRESSE</label>
          <input value={adresse} onChange={(e) => setAdresse(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2 text-sm" placeholder="Rue, ville, code postal" />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-mono text-neige/60 block mb-1">TÉLÉPHONE</label>
            <input value={telephone} onChange={(e) => setTelephone(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="flex-1">
            <label className="text-xs font-mono text-neige/60 block mb-1">E-MAIL</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="text-xs font-mono text-neige/60 block mb-1">IDENTIFIANT ENTREPRISE (SIRET, RIDET…)</label>
          <input value={numeroIdentification} onChange={(e) => setNumeroIdentification(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-mono text-neige/60 block mb-1">CONDITIONS DE RÈGLEMENT</label>
          <input
            value={conditionsReglement}
            onChange={(e) => setConditionsReglement(e.target.value)}
            className="w-full border border-ligne rounded-lg px-3 py-2 text-sm"
            placeholder="Ex. Acompte 30% à la commande, solde à la réception"
          />
        </div>
        <div>
          <label className="text-xs font-mono text-neige/60 block mb-1">VALIDITÉ DES DEVIS (JOURS)</label>
          <input
            type="number"
            min={1}
            value={validiteDevisJours}
            onChange={(e) => setValiditeDevisJours(Number(e.target.value))}
            className="w-32 border border-ligne rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <button type="submit" disabled={chargement} className="text-sm bg-rouille text-white font-semibold rounded-lg px-4 py-2 disabled:opacity-60">
          {chargement ? "Enregistrement…" : "Enregistrer"}
        </button>
        {enregistre && <span className="text-xs text-vert">Enregistré</span>}
      </div>
    </form>
  );
}
