"use client";

import type { ReactNode } from "react";
import Logo from "@/components/Logo";
import { LABEL_ROLE, useSidebar } from "@/components/SidebarContext";
import { initiales } from "@/lib/utils";

/**
 * En-tête de page : titre + sous-titre à gauche, action principale de la page
 * (ex. « Nouveau chantier ») et profil à droite.
 */
export default function TopBar({ titre, sousTitre, action }: { titre: ReactNode; sousTitre?: ReactNode; action?: ReactNode }) {
  const { profil } = useSidebar();

  return (
    <header className="print:hidden px-4 pb-2 pt-4 sm:px-8 sm:pt-7">
      {/* Sur téléphone, la sidebar est cachée : on rappelle la marque en haut. */}
      <div className="mb-4 flex items-center justify-between md:hidden">
        <Logo />
        {profil && (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-marine text-xs font-semibold text-white">{initiales(profil.nom)}</div>
        )}
      </div>

      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold tracking-tight text-encre sm:text-2xl">{titre}</h1>
          {sousTitre && <p className="mt-1 truncate text-sm text-encre/60">{sousTitre}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-4">
          {action}
          {profil && (
            <div className="hidden items-center gap-2.5 border-l border-ligne pl-4 md:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-marine text-xs font-semibold text-white">{initiales(profil.nom)}</div>
              <div className="hidden leading-tight lg:block">
                <div className="text-sm font-medium text-encre">{profil.nom}</div>
                <div className="text-xs text-encre/60">{LABEL_ROLE[profil.role] ?? profil.role}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
