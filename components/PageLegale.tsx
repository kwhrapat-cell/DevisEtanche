import Link from "next/link";

/** Coquille commune aux pages légales (mentions légales, confidentialité) :
 *  accessibles sans compte, donc en dehors de l'AppShell et du middleware. */
export default function PageLegale({
  titre,
  misAJour,
  children,
}: {
  titre: string;
  misAJour: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-papier px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <Link href="/login" className="flex items-center gap-2 font-display font-semibold text-lg text-neige mb-8">
          <span className="w-6 h-6 rounded-md bg-gradient-to-br from-rouille to-ambre inline-block shrink-0" />
          DevisEtanche
        </Link>

        <h1 className="font-display text-2xl font-semibold text-neige mb-1">{titre}</h1>
        <p className="text-xs text-neige/40 mb-8">Dernière mise à jour : {misAJour}</p>

        <div className="flex flex-col gap-7 text-sm leading-relaxed text-neige/70">{children}</div>

        <div className="mt-12 pt-6 border-t border-ligne flex flex-wrap gap-x-5 gap-y-2 text-xs text-neige/45">
          <Link href="/mentions-legales" className="hover:text-neige">Mentions légales</Link>
          <Link href="/confidentialite" className="hover:text-neige">Confidentialité</Link>
          <Link href="/login" className="hover:text-neige">Retour à la connexion</Link>
        </div>
      </div>
    </div>
  );
}

export function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-medium text-neige mb-2">{titre}</h2>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}
