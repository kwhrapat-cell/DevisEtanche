"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calculator, FileText, HardHat, House, Menu, Plus, type Icon } from "@/components/icons";
import { estActif } from "@/components/navigation";
import { useSidebar } from "@/components/SidebarContext";
import { cn } from "@/lib/utils";

/**
 * Barre de navigation du bas, sur téléphone uniquement (masquée à partir de md,
 * où la sidebar prend le relais). Le « + » central crée un chantier ; « Menu »
 * ouvre la sidebar complète.
 */
export default function BottomNav() {
  const pathname = usePathname();
  const { setOuvert, restreint } = useSidebar();

  const onglet = (href: string, label: string, IconeOnglet: Icon) => {
    const actif = estActif(pathname, href);
    return (
      <Link
        href={href}
        aria-current={actif ? "page" : undefined}
        className={cn("flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium", actif ? "text-primaire" : "text-encre/60")}
      >
        <IconeOnglet size={22} strokeWidth={actif ? 2.25 : 2} />
        {label}
      </Link>
    );
  };

  return (
    <nav
      className="print:hidden fixed inset-x-0 bottom-0 z-30 border-t border-ligne bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      aria-label="Navigation rapide"
    >
      <div className="mx-auto grid h-16 max-w-md grid-cols-5 items-center">
        {onglet("/dashboard", "Accueil", House)}
        {onglet("/chantiers", "Chantiers", HardHat)}
        {restreint ? (
          <span />
        ) : (
          <Link
            href="/chantiers/nouveau"
            aria-label="Nouveau chantier"
            className="mx-auto -mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-primaire text-white shadow-flottant ring-4 ring-fond transition active:scale-95"
          >
            <Plus size={28} strokeWidth={2.5} />
          </Link>
        )}
        {restreint ? onglet("/calculateur", "Calcul", Calculator) : onglet("/devis", "Devis", FileText)}
        <button onClick={() => setOuvert(true)} className="flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium text-encre/60">
          <Menu size={22} />
          Menu
        </button>
      </div>
    </nav>
  );
}
