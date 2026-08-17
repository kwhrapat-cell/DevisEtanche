"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BoutonDeconnexion from "@/components/BoutonDeconnexion";

const links = [
  { href: "/dashboard", label: "Tableau de bord", icon: "▦" },
  { href: "/chantiers", label: "Chantiers", icon: "◧" },
  { href: "/devis", label: "Devis", icon: "▤" },
  { href: "/clients", label: "Clients", icon: "◍" },
  { href: "/calculateur", label: "Calculateur", icon: "∑" },
  { href: "/catalogue", label: "Catalogue", icon: "▥" },
  { href: "/parametres", label: "Paramètres", icon: "⚙" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-ardoise text-white min-h-screen flex flex-col justify-between">
      <div>
        <div className="px-6 py-6">
          <div className="flex items-center gap-2 font-display font-semibold text-lg">
            <span className="w-7 h-7 rounded-md bg-gradient-to-br from-rouille to-ambre inline-block" />
            DevisEtanche
          </div>
          <p className="text-xs text-white/40 mt-1.5 leading-snug">
            L'écosystème des professionnels de l'étanchéité
          </p>
        </div>
        <nav className="mt-2 flex flex-col gap-1 px-3">
          {links.map((l) => {
            const actif = pathname === l.href || pathname?.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  actif ? "bg-rouille/15 text-white font-medium" : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className={`w-4 text-center ${actif ? "text-rouille-2" : ""}`}>{l.icon}</span>
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="px-6 py-6 text-xs text-white/40 border-t border-white/10 flex items-center justify-between">
        <span>MVP · module par module</span>
        <BoutonDeconnexion />
      </div>
    </aside>
  );
}
