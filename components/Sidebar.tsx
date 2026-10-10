"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BoutonDeconnexion from "@/components/BoutonDeconnexion";
import Logo from "@/components/Logo";
import { X } from "@/components/icons";
import { NAV_BAS, NAV_OUTILS, NAV_PRINCIPALE, estActif, type LienNav } from "@/components/navigation";
import { LABEL_ROLE, useSidebar } from "@/components/SidebarContext";
import { cn, initiales } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();
  const { ouvert, setOuvert, profil, restreint } = useSidebar();

  const visibles = (liens: LienNav[]) => (restreint ? liens.filter((l) => !l.masqueSousTraitant) : liens);

  const lien = (l: LienNav) => {
    const actif = estActif(pathname, l.href);
    const IconeLien = l.icone;
    return (
      <Link
        key={l.href}
        href={l.href}
        onClick={() => setOuvert(false)}
        aria-current={actif ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
          actif ? "bg-primaire font-medium text-white shadow-sm" : "text-white/70 hover:bg-white/10 hover:text-white"
        )}
      >
        <IconeLien size={19} className="shrink-0" />
        {l.label}
      </Link>
    );
  };

  return (
    <>
      {ouvert && (
        <div className="fixed inset-0 z-40 bg-marine/40 backdrop-blur-[2px] md:hidden" onClick={() => setOuvert(false)} aria-hidden="true" />
      )}
      <aside
        className={cn(
          "print:hidden fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col bg-marine text-white transition-transform duration-200 ease-out",
          "md:sticky md:top-0 md:z-auto md:h-screen md:w-64 md:translate-x-0",
          ouvert ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 pb-6 pt-6">
          <Link href="/dashboard" onClick={() => setOuvert(false)}>
            <Logo clair />
          </Link>
          <button
            onClick={() => setOuvert(false)}
            className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Fermer le menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3" aria-label="Navigation principale">
          {visibles(NAV_PRINCIPALE).map(lien)}
          <div className="px-3 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-wider text-white/40">Outils</div>
          {visibles(NAV_OUTILS).map(lien)}
          <div className="mt-auto pt-4">{visibles(NAV_BAS).map(lien)}</div>
        </nav>

        <div className="m-3 flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primaire text-xs font-semibold">
            {initiales(profil?.nom)}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-sm font-medium">{profil?.nom ?? "Mon compte"}</div>
            {profil && <div className="truncate text-xs text-white/50">{LABEL_ROLE[profil.role] ?? profil.role}</div>}
          </div>
          <BoutonDeconnexion />
        </div>
      </aside>
    </>
  );
}
