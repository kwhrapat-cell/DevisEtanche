import Link from "next/link";
import { COMPANY_INFO } from "@/lib/company-info";

export const metadata = {
  title: "Mentions légales — DevisEtanche",
};

export default function MentionsLegalesPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-6 text-sm text-neige/80 leading-relaxed">
      <Link href="/dashboard" className="text-xs text-rouille font-medium">← Retour à l'application</Link>
      <h1 className="font-display font-semibold text-2xl text-neige mt-4 mb-8">Mentions légales</h1>

      <section className="mb-8">
        <h2 className="font-medium text-neige mb-2">Éditeur du site et de l'application</h2>
        <p>
          L'application DevisEtanche est éditée par <strong>{COMPANY_INFO.raisonSociale}</strong>,{" "}
          {COMPANY_INFO.formeJuridique} (statut patenté), immatriculée au RIDET sous le numéro{" "}
          <strong>{COMPANY_INFO.ridet}</strong> (Nouvelle-Calédonie).
        </p>
        <p className="mt-2">
          Adresse : {COMPANY_INFO.adresse}
          <br />
          Contact : <a href={`mailto:${COMPANY_INFO.email}`} className="text-rouille">{COMPANY_INFO.email}</a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-medium text-neige mb-2">Directeur de la publication</h2>
        <p>{COMPANY_INFO.directeurPublication}</p>
      </section>

      <section className="mb-8">
        <h2 className="font-medium text-neige mb-2">Hébergement</h2>
        <p>
          Application hébergée par <strong>{COMPANY_INFO.hebergeurApplication}</strong>.
        </p>
        <p className="mt-2">
          Base de données, authentification et stockage des fichiers (photos de chantier) gérés par{" "}
          <strong>{COMPANY_INFO.hebergeurDonnees}</strong>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-medium text-neige mb-2">Propriété intellectuelle</h2>
        <p>
          L'application, sa structure, ses textes, son design et ses éléments graphiques sont la propriété de{" "}
          {COMPANY_INFO.raisonSociale}, sauf mention contraire. Toute reproduction non autorisée est interdite.
        </p>
      </section>

      <section>
        <h2 className="font-medium text-neige mb-2">Documents liés</h2>
        <p>
          <Link href="/cgv" className="text-rouille">Conditions générales de vente</Link>
          {" · "}
          <Link href="/confidentialite" className="text-rouille">Politique de confidentialité</Link>
        </p>
      </section>
    </div>
  );
}
