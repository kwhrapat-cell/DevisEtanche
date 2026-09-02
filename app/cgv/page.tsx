import Link from "next/link";
import { COMPANY_INFO } from "@/lib/company-info";

export const metadata = {
  title: "Conditions générales de vente — DevisEtanche",
};

export default function CGVPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-6 text-sm text-neige/80 leading-relaxed">
      <Link href="/dashboard" className="text-xs text-rouille font-medium">← Retour à l'application</Link>
      <h1 className="font-display font-semibold text-2xl text-neige mt-4 mb-1">Conditions générales de vente</h1>
      <p className="text-xs text-neige/50 mb-8">Éditées par {COMPANY_INFO.raisonSociale} ({COMPANY_INFO.formeJuridique}, RIDET {COMPANY_INFO.ridet}).</p>

      <section className="mb-8">
        <h2 className="font-medium text-neige mb-2">1. Objet</h2>
        <p>
          DevisEtanche est un service en ligne (SaaS) destiné aux entreprises d'étanchéité pour la gestion de
          chantiers, la réalisation de devis, le suivi de clients et, à terme, la facturation. L'accès au service
          se fait par abonnement, après création d'un compte.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-medium text-neige mb-2">2. Tarifs et abonnement</h2>
        <p>
          Le service est proposé sous plusieurs forfaits (dont un forfait gratuit "Découverte"), présentés sur la
          page Paramètres de l'application. Les tarifs sont indiqués toutes taxes comprises selon la zone du
          client (TVA en métropole, TGC en Nouvelle-Calédonie) ou hors taxe pour les clients hors du champ
          d'application de ces taxes. L'abonnement est mensuel et sans engagement de durée, sauf mention contraire
          au moment de la souscription.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-medium text-neige mb-2">3. Modalités de paiement</h2>
        <p>
          Le paiement des abonnements payants s'effectue par carte bancaire via un prestataire de paiement
          sécurisé (Stripe, ou un prestataire équivalent tel que Lyra selon la zone géographique du client). Le
          prélèvement est automatique et récurrent, à la même date chaque mois, jusqu'à résiliation.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-medium text-neige mb-2">4. Durée et résiliation</h2>
        <p>
          L'abonnement est reconduit tacitement chaque mois. Le client peut résilier à tout moment depuis la page
          Paramètres de l'application ou en contactant {COMPANY_INFO.email} ; la résiliation prend effet à la fin
          de la période déjà payée, sans remboursement au prorata sauf disposition légale contraire applicable au
          client.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-medium text-neige mb-2">5. Responsabilité</h2>
        <p>
          {COMPANY_INFO.raisonSociale} met en œuvre les moyens raisonnables pour assurer la disponibilité et la
          fiabilité du service, sans garantie de disponibilité continue (maintenance, incidents techniques
          indépendants de sa volonté). Les devis générés par l'outil restent sous la seule responsabilité du client
          qui les émet : {COMPANY_INFO.raisonSociale} ne vérifie ni leur contenu, ni leur conformité aux
          obligations propres au métier du client.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-medium text-neige mb-2">6. Propriété des données du client</h2>
        <p>
          Les données saisies par le client (chantiers, devis, clients, photos) restent sa propriété.{" "}
          {COMPANY_INFO.raisonSociale} agit en tant que sous-traitant au sens du RGPD pour l'hébergement et le
          traitement technique de ces données (voir la{" "}
          <Link href="/confidentialite" className="text-rouille">politique de confidentialité</Link>). Le client
          peut exporter ou demander la suppression de ses données à tout moment.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-medium text-neige mb-2">7. Disponibilité du service</h2>
        <p>
          Le service repose sur des infrastructures tierces ({COMPANY_INFO.hebergeurApplication.split(",")[0]},{" "}
          Supabase). Une application hors ligne partielle est proposée pour limiter l'impact des coupures réseau,
          sans garantir un fonctionnement identique à celui du mode connecté.
        </p>
      </section>

      <section>
        <h2 className="font-medium text-neige mb-2">8. Droit applicable</h2>
        <p>
          Les présentes conditions sont soumises au droit français. Pour les clients situés en Nouvelle-Calédonie,
          les dispositions fiscales locales (TGC) s'appliquent en lieu et place de la TVA métropolitaine, sans
          incidence sur le droit applicable au présent contrat.
        </p>
      </section>
    </div>
  );
}
