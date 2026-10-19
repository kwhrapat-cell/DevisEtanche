import Link from "next/link";
import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import { ArrowLeft } from "@/components/icons";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

/** Mise en page commune des pages légales (mentions légales, CGV, confidentialité). Accessibles sans connexion. */
export default function PageLegale({ titre, sousTitre, children }: { titre: string; sousTitre?: ReactNode; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-fond">
      <header className="border-b border-ligne bg-surface">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" aria-label="DevisEtanche — accueil">
            <Logo />
          </Link>
          {/* « / » renvoie vers l'accueil du rôle, ou vers la page d'accueil publique hors session. */}
          <ButtonLink href="/" variante="fantome" icone={ArrowLeft}>
            Retour
          </ButtonLink>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight text-encre">{titre}</h1>
        {sousTitre && <p className="mt-1 text-sm text-encre/60">{sousTitre}</p>}
        <Card className="mt-6 flex flex-col gap-8 p-5 text-sm leading-relaxed text-encre/80 sm:p-8">{children}</Card>
        <Footer className="mt-6" />
      </main>
    </div>
  );
}

export function SectionLegale({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-base font-semibold text-encre">{titre}</h2>
      {children}
    </section>
  );
}

/** Lien dans le texte d'une page légale. */
export const classeLien = "font-medium text-primaire hover:underline";
