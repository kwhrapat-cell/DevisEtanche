import type { ReactNode } from "react";
import { Inbox, type Icon } from "@/components/icons";

/** État vide : ce qu'on affiche quand une liste n'a encore rien — avec l'action suivante. */
export function EmptyState({ icone: IconeVide = Inbox, titre, texte, action }: { icone?: Icon; titre: string; texte?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-4 py-8 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-sable text-encre/50">
        <IconeVide size={24} />
      </div>
      <p className="font-medium text-encre">{titre}</p>
      {texte && <p className="mt-1 max-w-xs text-sm text-encre/60">{texte}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
