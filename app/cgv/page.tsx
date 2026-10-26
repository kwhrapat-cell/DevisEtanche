import Link from "next/link";
import PageLegale, { classeLien, SectionLegale } from "@/components/PageLegale";
import { COMPANY_INFO } from "@/lib/company-info";

export const metadata = {
  title: "Conditions générales de vente — DevisEtanche",
};

export default function CGVPage() {
  return (
    <PageLegale
      titre="Conditions générales de vente"
      sousTitre={`Éditées par ${COMPANY_INFO.raisonSociale} (${COMPANY_INFO.formeJuridique}, RIDET ${COMPANY_INFO.ridet}).`}
    >
      <SectionLegale titre="1. Objet">
        <p>
          DevisEtanche est un service en ligne (SaaS) destiné aux entreprises d'étanchéité pour la gestion de chantiers, la réalisation de devis et
          de factures, et le suivi de leurs clients. L'accès au service se fait par abonnement, après création d'un compte.
        </p>
      </SectionLegale>

      <SectionLegale titre="2. Tarifs et abonnement">
        <p>
          Le service est proposé sous plusieurs forfaits (dont un forfait gratuit « Découverte »), présentés sur la page Paramètres de
          l'application. Les tarifs sont indiqués toutes taxes comprises selon la zone du client (TVA en métropole, TGC en Nouvelle-Calédonie) ou
          hors taxe pour les clients hors du champ d'application de ces taxes. L'abonnement est mensuel et sans engagement de durée, sauf mention
          contraire au moment de la souscription.
        </p>
      </SectionLegale>

      <SectionLegale titre="3. Modalités de paiement">
        <p>
          Le paiement en ligne des abonnements payants s'effectue par carte bancaire ou PayPal auprès de Lemon Squeezy, revendeur agréé qui
          agit en tant que vendeur officiel (« merchant of record ») : Lemon Squeezy encaisse le paiement, applique les taxes éventuellement
          dues et adresse la facture au client. Le prélèvement est automatique et récurrent, à la même date chaque mois, jusqu'à résiliation.
          Un abonnement souscrit par e-mail auprès de {COMPANY_INFO.raisonSociale} est facturé directement par celle-ci.
        </p>
      </SectionLegale>

      <SectionLegale titre="4. Durée et résiliation">
        <p>
          L'abonnement est reconduit tacitement chaque mois. Le client peut le résilier à tout moment depuis « Gérer mon abonnement » dans les
          Paramètres de l'application, ou en écrivant à{" "}
          <a href={`mailto:${COMPANY_INFO.email}`} className={classeLien}>
            {COMPANY_INFO.email}
          </a>{" "}
          ; la résiliation prend effet à la fin de la période déjà payée, sans remboursement au prorata sauf disposition légale contraire
          applicable au client.
        </p>
      </SectionLegale>

      <SectionLegale titre="5. Responsabilité">
        <p>
          {COMPANY_INFO.raisonSociale} met en œuvre les moyens raisonnables pour assurer la disponibilité et la fiabilité du service, sans garantie
          de disponibilité continue (maintenance, incidents techniques indépendants de sa volonté). Les devis et factures générés par l'outil
          restent sous la seule responsabilité du client qui les émet : {COMPANY_INFO.raisonSociale} ne vérifie ni leur contenu, ni leur
          conformité aux obligations propres au métier du client.
        </p>
      </SectionLegale>

      <SectionLegale titre="6. Propriété des données du client">
        <p>
          Les données saisies par le client (chantiers, devis, factures, clients, photos) restent sa propriété. {COMPANY_INFO.raisonSociale} agit
          en tant que sous-traitant au sens du RGPD pour l'hébergement et le traitement technique de ces données (voir la{" "}
          <Link href="/confidentialite" className={classeLien}>
            politique de confidentialité
          </Link>
          ). Le client peut demander à tout moment l'export ou la suppression de ses données en écrivant à {COMPANY_INFO.email}.
        </p>
      </SectionLegale>

      <SectionLegale titre="7. Disponibilité du service">
        <p>
          Le service repose sur des infrastructures tierces (Vercel, Supabase). Un fonctionnement hors ligne partiel est proposé pour limiter
          l'impact des coupures réseau, sans garantir un fonctionnement identique à celui du mode connecté.
        </p>
      </SectionLegale>

      <SectionLegale titre="8. Droit applicable">
        <p>
          Les présentes conditions sont soumises au droit français. Pour les clients situés en Nouvelle-Calédonie, les dispositions fiscales
          locales (TGC) s'appliquent en lieu et place de la TVA métropolitaine, sans incidence sur le droit applicable au présent contrat.
        </p>
      </SectionLegale>
    </PageLegale>
  );
}
