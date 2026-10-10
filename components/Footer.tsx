import Link from "next/link";
import { cn } from "@/lib/utils";

/** Liens vers les pages légales — pages publiques (connexion, inscription, pages légales). */
export default function Footer({ className }: { className?: string }) {
  const lien = "inline-flex min-h-[44px] items-center px-1 hover:text-encre";
  return (
    <footer className={cn("relative z-10 flex flex-wrap items-center justify-center gap-x-2 text-xs text-encre/60", className)}>
      <Link href="/mentions-legales" className={lien}>
        Mentions légales
      </Link>
      <span aria-hidden="true">·</span>
      <Link href="/cgv" className={lien}>
        CGV
      </Link>
      <span aria-hidden="true">·</span>
      <Link href="/confidentialite" className={lien}>
        Confidentialité
      </Link>
    </footer>
  );
}
