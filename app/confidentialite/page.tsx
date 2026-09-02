import Link from "next/link";
import { COMPANY_INFO } from "@/lib/company-info";

export const metadata = {
  title: "Politique de confidentialité — DevisEtanche",
};

export default function ConfidentialitePage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-6 text-sm text-neige/80 leading-relaxed">
      <Link href="/dashboard" className="text-xs text-rouille font-medium">← Retour à l'application</Link>
      <h1 className="font-display font-semibold text-2xl text-neige mt-4 mb-8">Politique de confidentialité</h1>

      <section className="mb-8">
        <h2 className="font-medium text-neige mb-2">Responsable de traitement</h2>
        <p>
          {COMPANY_INFO.raisonSociale} ({COMPANY_INFO.formeJuridique}, RIDET {COMPANY_INFO.ridet}) est responsable
          du traitement des données personnelles collectées via l'application DevisEtanche.
        </p>
        <p className="mt-2">
          Contact : <a href={`mailto:${COMPANY_INFO.email}`} className="text-rouille">{COMPANY_INFO.email}</a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-medium text-neige mb-2">Données collectées</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Données de compte : nom, adresse e-mail, mot de passe (chiffré), rôle dans l'entreprise.</li>
          <li>Données d'entreprise : raison sociale, adresse, contact, numéro d'identification (SIRET / RIDET).</li>
          <li>Données de chantiers et de clients : nom, adresse, coordonnées, avancement, zones, devis et montants.</li>
          <li>Photos de chantier téléversées par les utilisateurs.</li>
          <li>Données de facturation de l'abonnement (traitées directement par le prestataire de paiement,
            jamais stockées par DevisEtanche : ni numéro de carte, ni cryptogramme).</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="font-medium text-neige mb-2">Finalités</h2>
        <p>
          Ces données sont utilisées pour fournir le service (gestion de chantiers, devis, clients), assurer
          l'authentification et la sécurité des comptes, gérer l'abonnement et la facturation, et améliorer le
          service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-medium text-neige mb-2">Base légale</h2>
        <p>
          Le traitement repose sur l'exécution du contrat conclu avec l'entreprise cliente lors de la souscription
          au service (article 6.1.b du RGPD), ainsi que, le cas échéant, sur le respect d'obligations légales et
          sur l'intérêt légitime de {COMPANY_INFO.raisonSociale} à sécuriser et améliorer le service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-medium text-neige mb-2">Durée de conservation</h2>
        <p>
          Les données sont conservées pendant toute la durée de l'abonnement, puis supprimées dans un délai
          raisonnable après la résiliation du compte, sauf obligation légale de conservation plus longue (par
          exemple les documents à caractère comptable ou fiscal).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-medium text-neige mb-2">Sous-traitants</h2>
        <p>Les données sont hébergées et traitées par les prestataires suivants, agissant en tant que sous-traitants :</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li><strong>Supabase</strong> — base de données, authentification, stockage des photos de chantier.</li>
          <li><strong>Vercel</strong> — hébergement de l'application.</li>
          <li><strong>Stripe</strong> (ou un prestataire de paiement équivalent, tel que Lyra pour la zone
            Nouvelle-Calédonie/Pacifique) — traitement des paiements d'abonnement.</li>
        </ul>
        <p className="mt-3 text-xs text-neige/50">
          {/* TODO: confirmer la région d'hébergement du projet Supabase (Project Settings) et ajuster ce
              paragraphe : mentionner explicitement le pays d'hébergement une fois vérifié. */}
          Certains de ces prestataires peuvent héberger ou traiter des données en dehors de l'Union européenne.
          Dans ce cas, ce transfert est encadré par les garanties prévues par ces prestataires (clauses
          contractuelles types de la Commission européenne ou mécanisme équivalent).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-medium text-neige mb-2">Vos droits</h2>
        <p>
          Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation,
          d'opposition et de portabilité sur vos données personnelles. Vous pouvez également demander la
          suppression de votre compte et de l'ensemble des données associées.
        </p>
        <p className="mt-2">
          Pour exercer ces droits, contactez <a href={`mailto:${COMPANY_INFO.email}`} className="text-rouille">{COMPANY_INFO.email}</a> ou
          utilisez l'option "Supprimer mon compte et mes données" depuis la page{" "}
          <Link href="/parametres" className="text-rouille">Paramètres</Link>.
        </p>
      </section>

      <section>
        <h2 className="font-medium text-neige mb-2">Documents liés</h2>
        <p>
          <Link href="/mentions-legales" className="text-rouille">Mentions légales</Link>
          {" · "}
          <Link href="/cgv" className="text-rouille">Conditions générales de vente</Link>
        </p>
      </section>
    </div>
  );
}
