import Link from "next/link";
import PageLegale, { classeLien, SectionLegale } from "@/components/PageLegale";
import { COMPANY_INFO } from "@/lib/company-info";

export const metadata = {
  title: "Mentions légales — DevisEtanche",
};

export default function MentionsLegalesPage() {
  return (
    <PageLegale titre="Mentions légales">
      <SectionLegale titre="Éditeur du site et de l'application">
        <p>
          L'application DevisEtanche est éditée par <strong>{COMPANY_INFO.raisonSociale}</strong>, {COMPANY_INFO.formeJuridique} (statut patenté),
          immatriculée au RIDET sous le numéro <strong>{COMPANY_INFO.ridet}</strong> (Nouvelle-Calédonie).
        </p>
        <p>
          Adresse : {COMPANY_INFO.adresse}
          <br />
          Contact :{" "}
          <a href={`mailto:${COMPANY_INFO.email}`} className={classeLien}>
            {COMPANY_INFO.email}
          </a>
        </p>
      </SectionLegale>

      <SectionLegale titre="Directeur de la publication">
        <p>{COMPANY_INFO.directeurPublication}</p>
      </SectionLegale>

      <SectionLegale titre="Hébergement">
        <p>
          Application hébergée par <strong>{COMPANY_INFO.hebergeurApplication}</strong>.
        </p>
        <p>
          Base de données, authentification et stockage des fichiers (photos de chantier) gérés par <strong>{COMPANY_INFO.hebergeurDonnees}</strong>.
        </p>
      </SectionLegale>

      <SectionLegale titre="Propriété intellectuelle">
        <p>
          L'application, sa structure, ses textes, son design et ses éléments graphiques sont la propriété de {COMPANY_INFO.raisonSociale}, sauf
          mention contraire. Toute reproduction non autorisée est interdite.
        </p>
      </SectionLegale>

      <SectionLegale titre="Documents liés">
        <p>
          <Link href="/cgv" className={classeLien}>
            Conditions générales de vente
          </Link>
          {" · "}
          <Link href="/confidentialite" className={classeLien}>
            Politique de confidentialité
          </Link>
        </p>
      </SectionLegale>
    </PageLegale>
  );
}
