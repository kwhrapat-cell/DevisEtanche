import { createClient } from "@/lib/supabase/client";

/**
 * File de synchronisation minimale : les écritures (texte/JSON uniquement —
 * pas de fichiers binaires) déclenchées hors connexion sont stockées dans
 * localStorage puis rejouées automatiquement à la reconnexion.
 */

const CLE = "devisetanche.file_attente";

export interface ActionEnAttente {
  id: string;
  table: string;
  donnees: Record<string, unknown>;
  horodatage: number;
}

function lireFile(): ActionEnAttente[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CLE) || "[]");
  } catch {
    return [];
  }
}

function ecrireFile(file: ActionEnAttente[]) {
  localStorage.setItem(CLE, JSON.stringify(file));
}

/** Ajoute une écriture à la file (à appeler quand navigator.onLine === false). */
export function queueAction(table: string, donnees: Record<string, unknown>) {
  const file = lireFile();
  file.push({ id: crypto.randomUUID(), table, donnees, horodatage: Date.now() });
  ecrireFile(file);
}

export function nombreEnAttente(): number {
  return lireFile().length;
}

/** Rejoue les écritures en attente. À appeler au montage des pages et sur l'évènement "online". */
export async function tenterVidage() {
  const file = lireFile();
  if (file.length === 0 || !navigator.onLine) return;

  const supabase = createClient();
  const restantes: ActionEnAttente[] = [];

  for (const action of file) {
    const { error } = await supabase.from(action.table).insert(action.donnees);
    if (error) restantes.push(action);
  }
  ecrireFile(restantes);
}
