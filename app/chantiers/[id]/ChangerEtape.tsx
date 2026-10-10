"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Undo2 } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { ETAPES_CHANTIER, indexEtape } from "@/lib/statuts";
import { createClient } from "@/lib/supabase/client";

/** Fait avancer (ou reculer) le chantier dans la frise vue par le client. */
export default function ChangerEtape({ chantierId, etape }: { chantierId: string; etape: string | null }) {
  const [actuelle, setActuelle] = useState(indexEtape(etape));
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const router = useRouter();

  async function aller(index: number) {
    if (!navigator.onLine) {
      setErreur("Connexion nécessaire pour changer l'étape.");
      return;
    }
    setErreur(null);
    setEnregistrement(true);
    const { error } = await createClient().from("chantiers").update({ etape: ETAPES_CHANTIER[index].cle }).eq("id", chantierId);
    setEnregistrement(false);
    if (error) {
      setErreur("L'étape n'a pas pu être enregistrée.");
      return;
    }
    setActuelle(index);
    router.refresh();
  }

  const suivante = ETAPES_CHANTIER[actuelle + 1];

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      {suivante && (
        <Button taille="lg" icone={ArrowRight} disabled={enregistrement} onClick={() => aller(actuelle + 1)} className="sm:order-2">
          Passer à : {suivante.label}
        </Button>
      )}
      {actuelle > 0 && (
        <Button variante="fantome" icone={Undo2} disabled={enregistrement} onClick={() => aller(actuelle - 1)} className="sm:order-1">
          Revenir à : {ETAPES_CHANTIER[actuelle - 1].label}
        </Button>
      )}
      {erreur && <p className="rounded-lg bg-rouge/10 px-3 py-2 text-sm text-rouge sm:order-3">{erreur}</p>}
    </div>
  );
}
