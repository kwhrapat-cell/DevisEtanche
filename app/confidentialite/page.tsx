import PageLegale, { Section } from "@/components/PageLegale";

export const metadata = { title: "Politique de confidentialité — DevisEtanche" };

export default function ConfidentialitePage() {
  return (
    <PageLegale titre="Politique de confidentialité" misAJour="17 août 2026">
      <Section titre="Données que nous collectons">
        <p>DevisEtanche enregistre uniquement les données nécessaires au fonctionnement du service :</p>
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li>
            <strong className="text-neige/90 font-medium">Votre compte</strong> : adresse e-mail, mot de passe
            (chiffré, jamais lisible par l'éditeur), nom et rôle dans l'entreprise.
          </li>
          <li>
            <strong className="text-neige/90 font-medium">Votre entreprise</strong> : raison sociale, adresse,
            téléphone, e-mail, numéro d'identification (RIDET / SIRET), devise et taux de taxe.
          </li>
          <li>
            <strong className="text-neige/90 font-medium">Vos clients</strong> : nom, type, ville, e-mail,
            téléphone — saisis par vous.
          </li>
          <li>
            <strong className="text-neige/90 font-medium">Votre activité</strong> : chantiers, zones, devis,
            factures, photos de chantier.
          </li>
        </ul>
        <p>
          Aucune donnée bancaire n'est collectée ni stockée : le service n'est pas commercialisé à ce stade et
          aucun paiement n'est encaissé.
        </p>
      </Section>

      <Section titre="Qui est responsable de quoi">
        <p>
          Lorsque vous saisissez les coordonnées de vos propres clients, c'est votre entreprise qui reste
          responsable de ces données. L'éditeur de DevisEtanche agit comme prestataire technique : il héberge
          ces données pour votre compte et ne les exploite à aucune autre fin.
        </p>
      </Section>

      <Section titre="Cloisonnement des données">
        <p>
          Chaque entreprise ne peut consulter que ses propres données. Ce cloisonnement est appliqué au niveau
          de la base de données elle-même (politiques de sécurité par ligne), et non uniquement par
          l'interface : un compte ne peut pas accéder aux chantiers, clients ou devis d'une autre entreprise.
        </p>
      </Section>

      <Section titre="Utilisation et partage">
        <p>
          Vos données servent exclusivement à faire fonctionner le service. Elles ne sont ni vendues, ni
          louées, ni transmises à des tiers à des fins commerciales ou publicitaires.
        </p>
        <p>
          Seuls les prestataires techniques indispensables y ont accès dans ce cadre : Supabase (hébergement de
          la base de données) et Vercel (hébergement de l'application).
        </p>
      </Section>

      <Section titre="Conservation">
        <p>
          Vos données sont conservées tant que votre compte est actif. Les devis et factures peuvent devoir
          être conservés plus longtemps pour répondre aux obligations comptables applicables à votre
          entreprise.
        </p>
      </Section>

      <Section titre="Vos droits">
        <p>
          Vous pouvez demander à consulter, corriger, exporter ou supprimer vos données, ainsi que la
          suppression de votre compte, en écrivant à kwhrapat@gmail.com.
        </p>
      </Section>

      <Section titre="Cookies">
        <p>
          L'application n'utilise pas de cookie publicitaire ni de traceur d'audience. Seuls des cookies
          techniques de session sont déposés, pour vous maintenir connecté à votre espace.
        </p>
      </Section>
    </PageLegale>
  );
}
