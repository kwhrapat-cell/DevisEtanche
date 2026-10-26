import Link from "next/link";
import PageLegale, { classeLien, SectionLegale } from "@/components/PageLegale";
import { COMPANY_INFO } from "@/lib/company-info";

export const metadata = {
  title: "Politique de confidentialité — DevisEtanche",
};

export default function ConfidentialitePage() {
  const contact = (
    <a href={`mailto:${COMPANY_INFO.email}`} className={classeLien}>
      {COMPANY_INFO.email}
    </a>
  );

  return (
    <PageLegale titre="Politique de confidentialité">
      <SectionLegale titre="Responsable de traitement">
        <p>
          {COMPANY_INFO.raisonSociale} ({COMPANY_INFO.formeJuridique}, RIDET {COMPANY_INFO.ridet}) est responsable du traitement des données
          personnelles collectées via l'application DevisEtanche.
        </p>
        <p>Contact : {contact}</p>
      </SectionLegale>

      <SectionLegale titre="Données collectées">
        <ul className="list-disc space-y-1 pl-5">
          <li>Données de compte : nom, adresse e-mail, mot de passe (chiffré), rôle dans l'entreprise.</li>
          <li>Données d'entreprise : raison sociale, forme juridique, adresse, contact, numéro d'identification (SIRET / RIDET).</li>
          <li>Données de chantiers et de clients : nom, adresse, coordonnées, avancement, zones, plans, devis, factures et montants.</li>
          <li>Photos de chantier et plans téléversés par les utilisateurs.</li>
          <li>
            Données de facturation de l'abonnement (traitées directement par le prestataire de paiement, jamais stockées par DevisEtanche : ni
            numéro de carte, ni cryptogramme).
          </li>
        </ul>
      </SectionLegale>

      <SectionLegale titre="Finalités">
        <p>
          Ces données sont utilisées pour fournir le service (gestion de chantiers, devis, factures, clients, suivi client), assurer
          l'authentification et la sécurité des comptes, gérer l'abonnement et la facturation, et améliorer le service.
        </p>
      </SectionLegale>

      <SectionLegale titre="Base légale">
        <p>
          Le traitement repose sur l'exécution du contrat conclu avec l'entreprise cliente lors de la souscription au service (article 6.1.b du
          RGPD), ainsi que, le cas échéant, sur le respect d'obligations légales et sur l'intérêt légitime de {COMPANY_INFO.raisonSociale} à
          sécuriser et améliorer le service.
        </p>
      </SectionLegale>

      <SectionLegale titre="Durée de conservation">
        <p>
          Les données sont conservées pendant toute la durée de l'abonnement, puis supprimées dans un délai raisonnable après la résiliation du
          compte, sauf obligation légale de conservation plus longue (par exemple les documents à caractère comptable ou fiscal).
        </p>
      </SectionLegale>

      <SectionLegale titre="Sous-traitants">
        <p>Les données sont hébergées et traitées par les prestataires suivants, agissant en tant que sous-traitants :</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Supabase</strong> — base de données, authentification, stockage des photos et plans de chantier.
          </li>
          <li>
            <strong>Vercel</strong> — hébergement de l'application.
          </li>
          <li>
            <strong>Lemon Squeezy</strong> (groupe Stripe) — encaissement des abonnements payés en ligne, en tant que revendeur : il reçoit
            l'adresse e-mail et les informations de paiement saisies sur sa page de paiement.
          </li>
        </ul>
        <p className="text-xs text-encre/60">
          {/* TODO: confirmer la région d'hébergement du projet Supabase (Project Settings) et mentionner
              explicitement le pays d'hébergement une fois vérifié. */}
          Certains de ces prestataires peuvent héberger ou traiter des données en dehors de l'Union européenne. Dans ce cas, ce transfert est
          encadré par les garanties prévues par ces prestataires (clauses contractuelles types de la Commission européenne ou mécanisme
          équivalent).
        </p>
      </SectionLegale>

      <SectionLegale titre="Vos droits">
        <p>
          Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité sur
          vos données personnelles. Vous pouvez également demander la suppression de votre compte et de l'ensemble des données associées.
        </p>
        <p>
          Pour exercer ces droits, écrivez à {contact} depuis l'adresse e-mail de votre compte, ou utilisez le bouton « Demander la suppression de
          mon compte » de la page{" "}
          <Link href="/parametres" className={classeLien}>
            Paramètres
          </Link>
          .
        </p>
      </SectionLegale>

      <SectionLegale titre="Documents liés">
        <p>
          <Link href="/mentions-legales" className={classeLien}>
            Mentions légales
          </Link>
          {" · "}
          <Link href="/cgv" className={classeLien}>
            Conditions générales de vente
          </Link>
        </p>
      </SectionLegale>
    </PageLegale>
  );
}
