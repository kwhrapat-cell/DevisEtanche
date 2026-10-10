import type { Metadata } from "next";
import TopBar from "@/components/TopBar";
import { Camera, FileText, HardHat, Plus, TriangleAlert } from "@/components/icons";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar, ProgressRing } from "@/components/ui/Progress";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { STATUTS, TONS, type Domaine } from "@/lib/statuts";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Design system — DevisEtanche",
  robots: { index: false, follow: false },
};

/**
 * Page de référence du design system : chaque brique de l'interface, au même
 * endroit. On la consulte avant de construire un nouvel écran, et on vérifie ici
 * qu'un changement de couleur ou de composant rend bien partout.
 * Aucune donnée réelle — accessible sans connexion.
 */

const COULEURS = [
  { nom: "fond", classe: "bg-fond", role: "Fond de page" },
  { nom: "surface", classe: "bg-surface", role: "Cartes, champs" },
  { nom: "sable", classe: "bg-sable", role: "Survol, pistes" },
  { nom: "ligne", classe: "bg-ligne", role: "Bordures" },
  { nom: "encre", classe: "bg-encre", role: "Texte" },
  { nom: "marine", classe: "bg-marine", role: "Sidebar" },
  { nom: "primaire", classe: "bg-primaire", role: "Actions" },
  { nom: "accent", classe: "bg-accent", role: "Marque" },
];

const DOMAINES: { domaine: Domaine; titre: string }[] = [
  { domaine: "zone", titre: "Zones" },
  { domaine: "chantier", titre: "Chantiers" },
  { domaine: "devis", titre: "Devis" },
  { domaine: "facture", titre: "Factures" },
];

const ZONES_EXEMPLE = [
  { nom: "Zone A", statut: "termine", surface: 320, pct: 100 },
  { nom: "Zone B", statut: "en_cours", surface: 410, pct: 65 },
  { nom: "Terrasse", statut: "probleme", surface: 95, pct: 40 },
  { nom: "Zone D", statut: "en_attente", surface: 280, pct: 0 },
];

function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-encre/50">{titre}</h2>
      {children}
    </section>
  );
}

export default function DesignPage() {
  return (
    <>
      <TopBar
        titre="Design system"
        sousTitre="Les briques de l'interface DevisEtanche — exemples sans données réelles."
        action={
          <ButtonLink href="/dashboard" variante="secondaire" className="hidden sm:inline-flex">
            Retour à l'app
          </ButtonLink>
        }
      />

      <div className="flex flex-col gap-10 p-4 sm:p-8">
        <Section titre="Couleurs">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {COULEURS.map((c) => (
              <div key={c.nom} className="card overflow-hidden">
                <div className={cn("h-14 border-b border-ligne", c.classe)} />
                <div className="p-2.5">
                  <div className="text-sm font-medium">{c.nom}</div>
                  <div className="text-xs text-encre/60">{c.role}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section titre="Boutons">
          <Card className="flex flex-wrap items-center gap-3 p-5">
            <Button icone={Plus}>Nouveau chantier</Button>
            <Button variante="secondaire">Annuler</Button>
            <Button variante="fantome">Plus tard</Button>
            <Button variante="danger" icone={TriangleAlert}>
              Signaler un problème
            </Button>
            <Button taille="sm">Petit</Button>
            <Button disabled>Désactivé</Button>
          </Card>
          <Card className="flex flex-col gap-3 p-5 sm:max-w-sm">
            <p className="text-sm text-encre/60">Taille « chantier » (48 px) : utilisable avec des gants.</p>
            <Button taille="lg" icone={Camera} pleineLargeur>
              Prendre une photo
            </Button>
            <Button taille="lg" variante="secondaire" icone={FileText} pleineLargeur>
              Nouveau devis
            </Button>
          </Card>
        </Section>

        <Section titre="Statuts (lib/statuts.ts)">
          <Card className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
            {DOMAINES.map(({ domaine, titre }) => (
              <div key={domaine}>
                <div className="mb-2 text-sm font-medium">{titre}</div>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(STATUTS[domaine]).map((s) => (
                    <StatusBadge key={s} domaine={domaine} statut={s} />
                  ))}
                </div>
              </div>
            ))}
          </Card>
        </Section>

        <Section titre="Zones">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {ZONES_EXEMPLE.map((z) => {
              const { ton } = STATUTS.zone[z.statut as keyof typeof STATUTS.zone];
              return (
                <div key={z.nom} className={cn("flex h-32 flex-col justify-between rounded-2xl border-2 p-4", TONS[ton].teinte)}>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold">{z.nom}</span>
                  </div>
                  <div>
                    <StatusBadge domaine="zone" statut={z.statut} className="mb-2 bg-surface/80" />
                    <ProgressBar valeur={z.pct} ton={ton} afficherValeur />
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        <Section titre="Avancement">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="flex items-center gap-5 p-5">
              <ProgressRing valeur={68} libelle="en cours" />
              <div className="flex-1 text-sm text-encre/70">Anneau : accueil, fiche chantier, espace client.</div>
            </Card>
            <Card className="flex flex-col justify-center gap-4 p-5 lg:col-span-2">
              <ProgressBar valeur={100} afficherValeur />
              <ProgressBar valeur={68} afficherValeur />
              <ProgressBar valeur={30} ton="danger" afficherValeur />
            </Card>
          </div>
        </Section>

        <Section titre="Chiffres clés">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Chantiers en cours" valeur={7} icone={HardHat} ton="info" indication="+2 cette semaine" href="/design" />
            <StatCard label="Devis en attente" valeur={4} icone={FileText} ton="alerte" indication="Action requise" />
            <StatCard label="Réserves ouvertes" valeur={2} icone={TriangleAlert} ton="danger" />
          </div>
        </Section>

        <Section titre="État vide">
          <Card>
            <CardHeader titre="Mes chantiers" className="px-5 pt-5" />
            <EmptyState
              icone={HardHat}
              titre="Aucun chantier pour l'instant"
              texte="Créez votre premier chantier pour suivre son avancement zone par zone."
              action={<Button icone={Plus} taille="lg">Créer un chantier</Button>}
            />
          </Card>
        </Section>
      </div>
    </>
  );
}
