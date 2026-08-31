"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import BoutonDeconnexion from "@/components/BoutonDeconnexion";
import { useSidebar } from "@/components/SidebarContext";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/dashboard", label: "Tableau de bord", icon: "▦" },
  { href: "/chantiers", label: "Chantiers", icon: "◧" },
  { href: "/devis", label: "Devis", icon: "▤" },
  { href: "/factures", label: "Factures", icon: "▧" },
  { href: "/clients", label: "Clients", icon: "◍" },
  { href: "/calculateur", label: "Calculateur", icon: "∑" },
  { href: "/catalogue", label: "Catalogue", icon: "▥" },
  { href: "/parametres", label: "Paramètres", icon: "⚙" },
  { href: "/portefeuille", label: "Portefeuille", icon: "◫" },
];

// Un sous-traitant restreint (chantier_assigne_id renseigné) n'a pas accès aux
// devis/factures (marges), aux clients, ni aux paramètres de l'entreprise —
// voir les policies RLS dans supabase/schema.sql. On masque ces liens plutôt
// que de laisser des pages vides/confuses.
const LIENS_MASQUES_SOUSTRAITANT = ["/devis", "/factures", "/clients", "/parametres", "/portefeuille"];

// Un donneur d'ordre suit son portefeuille de chantiers en lecture seule : il
// n'a ni devis/factures/marges, ni catalogue produits, ni tableau de bord
// entreprise (ceux-ci nécessitent entreprise_id_courante() sur SA propre
// entreprise "donneur d'ordre", jamais sur celle des entreprises exécutantes
// qu'il suit) — voir les policies RLS dans supabase/migration-donneur-ordre.sql.
const LIENS_MASQUES_DONNEUR_ORDRE = ["/dashboard", "/chantiers", "/devis", "/factures", "/clients", "/calculateur", "/catalogue"];

export default function Sidebar() {
  const pathname = usePathname();
  const { ouvert, setOuvert } = useSidebar();
  const [restreint, setRestreint] = useState(false);
  const [estDonneurOrdre, setEstDonneurOrdre] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data } = await supabase.from("profiles").select("chantier_assigne_id, role").eq("id", userData.user.id).single();
      setRestreint(!!data?.chantier_assigne_id);
      setEstDonneurOrdre(data?.role === "donneur_ordre");
    })();
  }, []);

  const liensVisibles = estDonneurOrdre
    ? links.filter((l) => !LIENS_MASQUES_DONNEUR_ORDRE.includes(l.href))
    : restreint
    ? links.filter((l) => !LIENS_MASQUES_SOUSTRAITANT.includes(l.href))
    : links.filter((l) => l.href !== "/portefeuille");

  return (
    <>
      {ouvert && (
        <div
          className="fixed inset-0 bg-black/25 backdrop-blur-[2px] z-40 md:hidden transition-opacity duration-200"
          onClick={() => setOuvert(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={`print:hidden w-52 md:w-64 shrink-0 bg-ardoise text-white min-h-screen flex flex-col justify-between fixed md:static inset-y-0 left-0 z-50 transition-transform duration-200 ease-out ${
          ouvert ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div>
          <div className="px-6 py-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 font-display font-semibold text-lg">
                <span className="w-7 h-7 rounded-md bg-gradient-to-br from-rouille to-ambre inline-block shrink-0" />
                DevisEtanche
              </div>
              <p className="text-xs text-white/40 mt-1.5 leading-snug">
                L'écosystème des professionnels de l'étanchéité
              </p>
            </div>
            <button
              onClick={() => setOuvert(false)}
              className="md:hidden text-white/60 hover:text-white text-xl leading-none px-1"
              aria-label="Fermer le menu"
            >
              ✕
            </button>
          </div>
          <nav className="mt-2 flex flex-col gap-1 px-3">
            {liensVisibles.map((l) => {
              const actif = pathname === l.href || pathname?.startsWith(`${l.href}/`);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOuvert(false)}
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
    </>
  );
}
