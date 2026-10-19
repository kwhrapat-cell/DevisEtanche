import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import { CircleCheck, Plus } from "@/components/icons";
import { ButtonLink } from "@/components/ui/Button";
import { COMPANY_INFO } from "@/lib/company-info";
import CoupeTerrasse from "./CoupeTerrasse";
import FormulairePilote from "./FormulairePilote";

/**
 * Page d'accueil publique (visiteurs non connectés). Son seul travail : qu'une
 * entreprise d'étanchéité demande à devenir pilote, ou crée un compte gratuit.
 * Les connectés n'arrivent jamais ici : app/page.tsx les renvoie vers leur accueil.
 */

const ETAPES = [
  {
    titre: "Chiffrer",
    texte:
      "Surface, relevés, primaire, isolant, gravillons : le calculateur compte tout selon les DTU 43.1, 43.3, 43.4 et 43.6, avec les références Soprema, Sika et Axter, puis prépare le devis.",
  },
  {
    titre: "Piloter",
    texte:
      "Découpez le chantier en zones sur le plan et suivez leur état en couleur. Photos, journal d'activité, et sous-traitants invités avec un simple code.",
  },
  {
    titre: "Livrer",
    texte:
      "Votre client suit l'avancement depuis un lien, sans créer de compte. Devis et factures en PDF, en XPF avec TGC ou en euros avec TVA.",
  },
];

const TERRAIN = [
  "S'installe sur le téléphone depuis le navigateur, sans passer par un store.",
  "Fonctionne sans réseau : vos saisies partent dès que le signal revient.",
  "Gros boutons, lisibles en plein soleil, utilisables avec des gants.",
  "Un sous-traitant ne voit que le chantier où vous l'avez invité.",
];

const FORFAITS = [
  { nom: "Découverte", pourQui: "Pour essayer l'outil", prix: "Gratuit", metropole: null },
  { nom: "Artisan", pourQui: "Pour l'étancheur à son compte", prix: "3 500 XPF / mois", metropole: "29 € par mois en métropole" },
  { nom: "Pro", pourQui: "Pour l'entreprise et ses équipes", prix: "7 000 XPF / mois", metropole: "59 € par mois en métropole" },
  { nom: "Entreprise", pourQui: "Plusieurs équipes, donneurs d'ordre", prix: "Sur devis", metropole: null },
];

const QUESTIONS = [
  {
    question: "Où sont stockées mes données ?",
    reponse:
      "Chez des hébergeurs professionnels : Supabase pour les données, Vercel pour l'application. Chaque entreprise ne voit que ses propres données, et vous pouvez demander leur suppression à tout moment.",
  },
  {
    question: "Que voit un sous-traitant ?",
    reponse: "Uniquement le chantier pour lequel vous lui donnez un code. Ni vos devis, ni vos factures, ni vos clients.",
  },
  {
    question: "Faut-il du réseau sur le chantier ?",
    reponse: "Non. Ce que vous saisissez hors connexion est gardé sur le téléphone et envoyé dès que le signal revient.",
  },
  {
    question: "Mes clients doivent-ils créer un compte ?",
    reponse: "Non. Ils reçoivent un lien personnel pour suivre l'avancement de leur chantier.",
  },
];

const conteneur = "mx-auto w-full max-w-5xl px-4 sm:px-6";
const titreSection = "text-2xl font-bold tracking-tight text-encre sm:text-3xl";

export default function PageVitrine() {
  return (
    <div className="min-h-screen bg-fond text-encre">
      <header className={`${conteneur} flex h-16 items-center justify-between`}>
        <Logo />
        <ButtonLink href="/login" variante="fantome">
          Se connecter
        </ButtonLink>
      </header>

      <main>
        {/* Accroche */}
        <section className={`${conteneur} grid items-center gap-10 pb-16 pt-6 lg:grid-cols-[1.1fr_1fr] lg:pt-12`}>
          <div>
            <h1 className="text-balance text-[2.15rem] font-bold leading-[1.1] tracking-tight text-encre sm:text-5xl">
              Le logiciel des chantiers d'étanchéité, du métré à la réception.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-encre/70">
              Chiffrez une toiture-terrasse selon les DTU, avec les vraies références fabricants. Puis suivez chaque zone, chaque équipe et chaque photo
              jusqu'à la réception. Sur le téléphone, même sans réseau.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="#pilote" variante="marque" taille="lg">
                Devenir entreprise pilote
              </ButtonLink>
              <ButtonLink href="/signup" variante="secondaire" taille="lg">
                Essayer gratuitement
              </ButtonLink>
            </div>
            <p className="mt-4 text-sm text-encre/60">Offre pilote : 3 mois offerts pour trois entreprises calédoniennes.</p>
          </div>

          <figure className="rounded-2xl border border-ligne bg-surface p-4 shadow-carte sm:p-6">
            <CoupeTerrasse className="h-auto w-full" />
            <figcaption className="mt-4 border-t border-ligne pt-3 text-sm leading-relaxed text-encre/70">
              Membranes, relevés, primaire, isolant et gravillons : le calculateur les compte pour vous, selon les DTU 43.x.
            </figcaption>
          </figure>
        </section>

        {/* Le fondateur : la preuve n°1 tant qu'il n'y a pas de client */}
        <section className="bg-marine text-white">
          <div className={`${conteneur} py-14 sm:py-16`}>
            <h2 className="max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">Conçu sur le terrain, par un étancheur.</h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
              Patrice a passé une quinzaine d'années en étanchéité et en maintenance industrielle sur les grands sites calédoniens : KNS, SLN Doniambo,
              Goro. DevisEtanche reprend ce qu'il faisait à la main sur chantier : métrer, compter les rouleaux, suivre les zones, prouver le travail fait.
            </p>
          </div>
        </section>

        {/* Du métré à la réception : c'est une vraie suite d'étapes, d'où la numérotation */}
        <section className={`${conteneur} py-16`}>
          <h2 className={titreSection}>Du métré à la réception, dans la même appli</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
            {ETAPES.map((etape, i) => (
              <li key={etape.titre} className="relative border-l-2 border-accent pl-5 md:border-l-0 md:border-t-2 md:pl-0 md:pt-5">
                <div className="text-sm font-semibold text-encre/60">Étape {i + 1}</div>
                <h3 className="mt-1 text-xl font-bold tracking-tight text-encre">{etape.titre}</h3>
                <p className="mt-2 leading-relaxed text-encre/70">{etape.texte}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Terrain */}
        <section className="border-y border-ligne bg-surface">
          <div className={`${conteneur} grid gap-8 py-16 md:grid-cols-[1fr_1.4fr]`}>
            <h2 className={titreSection}>Fait pour le terrain, pas pour le bureau</h2>
            <ul className="flex flex-col gap-4">
              {TERRAIN.map((ligne) => (
                <li key={ligne} className="flex items-start gap-3 text-lg leading-relaxed text-encre/80">
                  <CircleCheck size={22} className="mt-1 shrink-0 text-accent" />
                  {ligne}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Tarifs */}
        <section className={`${conteneur} py-16`}>
          <h2 className={titreSection}>Tarifs</h2>
          <p className="mt-2 text-encre/70">Prix hors taxes, sans engagement, résiliable chaque mois.</p>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
            <div className="rounded-2xl border-2 border-accent bg-surface p-6">
              <h3 className="text-xl font-bold tracking-tight text-encre">Offre pilote</h3>
              <p className="mt-2 leading-relaxed text-encre/70">
                3 mois offerts pour trois entreprises calédoniennes, en échange de vos retours sur de vrais chantiers. Patrice vous accompagne pour la
                prise en main.
              </p>
              <ButtonLink href="#pilote" variante="marque" taille="lg" className="mt-5">
                Devenir entreprise pilote
              </ButtonLink>
            </div>

            <ul className="card divide-y divide-ligne">
              {FORFAITS.map((f) => (
                <li key={f.nom} className="flex items-start justify-between gap-4 p-5">
                  <div className="min-w-0">
                    <div className="font-semibold text-encre">{f.nom}</div>
                    <div className="mt-0.5 text-sm text-encre/60">{f.pourQui}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-semibold text-encre">{f.prix}</div>
                    {f.metropole && <div className="mt-0.5 text-xs text-encre/60">{f.metropole}</div>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Questions fréquentes */}
        <section className={`${conteneur} pb-16`}>
          <h2 className={titreSection}>Questions fréquentes</h2>
          <div className="card mt-8 divide-y divide-ligne">
            {QUESTIONS.map((q) => (
              <details key={q.question} className="group px-5">
                <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 font-semibold text-encre [&::-webkit-details-marker]:hidden">
                  {q.question}
                  <Plus size={20} className="shrink-0 text-encre/60 transition-transform group-open:rotate-45 motion-reduce:transition-none" />
                </summary>
                <p className="pb-5 leading-relaxed text-encre/70">{q.reponse}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Demande de pilote */}
        <section id="pilote" className="scroll-mt-4 border-t border-ligne bg-surface">
          <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
            <h2 className={titreSection}>Devenir entreprise pilote</h2>
            <p className="mb-8 mt-3 text-lg leading-relaxed text-encre/70">
              Trois entreprises calédoniennes testent DevisEtanche sur leurs vrais chantiers, gratuitement pendant 3 mois. Laissez vos coordonnées :
              Patrice vous rappelle pour en parler.
            </p>
            <FormulairePilote />
          </div>
        </section>
      </main>

      <footer className={`${conteneur} flex flex-col items-center gap-3 py-10 text-center`}>
        <Logo />
        <p className="text-sm text-encre/60">
          {COMPANY_INFO.raisonSociale}, Païta, Nouvelle-Calédonie.{" "}
          <a href={`mailto:${COMPANY_INFO.email}`} className="font-medium text-encre/80 underline-offset-2 hover:underline">
            {COMPANY_INFO.email}
          </a>
        </p>
        <Footer />
      </footer>
    </div>
  );
}
