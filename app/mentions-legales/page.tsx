import PageLegale, { Section, AComplete } from "@/components/PageLegale";

export const metadata = { title: "Mentions légales — DevisEtanche" };

export default function MentionsLegalesPage() {
  return (
    <PageLegale titre="Mentions légales" misAJour="17 août 2026">
      <Section titre="Éditeur">
        <p>
          L'application DevisEtanche est éditée par <AComplete>nom ou raison sociale à compléter</AComplete>,
          dont le siège est situé <AComplete>adresse à compléter</AComplete>, immatriculé sous le numéro{" "}
          <AComplete>RIDET / SIRET à compléter</AComplete>.
        </p>
        <p>
          Contact : <AComplete>adresse e-mail à compléter</AComplete>
        </p>
        <p>
          Directeur de la publication : <AComplete>nom à compléter</AComplete>
        </p>
      </Section>

      <Section titre="Hébergement">
        <p>
          L'application est hébergée par Vercel Inc. (États-Unis) — vercel.com. Les données saisies dans
          l'application sont stockées par Supabase, Inc. — supabase.com, dans la région{" "}
          <AComplete>région du projet Supabase à compléter</AComplete>.
        </p>
      </Section>

      <Section titre="Objet du service">
        <p>
          DevisEtanche est un outil professionnel destiné aux entreprises d'étanchéité : suivi de chantiers,
          calcul de quantités, établissement de devis et de factures. Les estimations produites par le
          calculateur reposent sur des ratios usuels et ne se substituent pas à une note de calcul ni au DTU
          applicable au support réel : elles doivent être vérifiées par un professionnel avant commande ou
          engagement contractuel.
        </p>
      </Section>

      <Section titre="Propriété intellectuelle">
        <p>
          Le code, l'interface et les contenus de l'application sont la propriété de l'éditeur. Les données
          saisies par une entreprise utilisatrice (clients, chantiers, devis, factures, photos) restent la
          propriété de cette entreprise.
        </p>
        <p>
          Les noms de fabricants et références produits figurant au catalogue sont cités à titre documentaire
          et restent la propriété de leurs titulaires respectifs. Les prix indicatifs sont donnés à titre de
          repère et n'engagent ni l'éditeur ni les fabricants.
        </p>
      </Section>

      <Section titre="Responsabilité">
        <p>
          L'éditeur met tout en œuvre pour assurer l'exactitude des informations et la disponibilité du
          service, sans pouvoir la garantir. Il ne saurait être tenu responsable des conséquences d'une
          erreur de saisie, d'une estimation non vérifiée ou d'une interruption du service.
        </p>
      </Section>
    </PageLegale>
  );
}
