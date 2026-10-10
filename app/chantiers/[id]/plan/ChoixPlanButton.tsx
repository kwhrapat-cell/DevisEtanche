"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Image } from "@/components/icons";
import { classesBouton } from "@/components/ui/Button";
import { envoyerPlan } from "@/lib/photos";
import { cn } from "@/lib/utils";

/** Bouton d'envoi (ou de remplacement) de l'image du plan du chantier. */
export default function ChoixPlanButton({ chantierId, remplacer = false }: { chantierId: string; remplacer?: boolean }) {
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const router = useRouter();

  async function surSelection(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    e.target.value = "";
    if (!fichier) return;
    if (remplacer && !confirm("Remplacer le plan ? Les zones déjà dessinées garderont leur position.")) return;
    setErreur(null);
    setEnvoi(true);
    const resultat = await envoyerPlan(chantierId, fichier);
    setEnvoi(false);
    if ("erreur" in resultat) {
      setErreur(resultat.erreur);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {/* <label> plutôt que <Button> : c'est lui qui ouvre le choix du fichier. */}
      <label
        className={cn(
          classesBouton(remplacer ? { variante: "fantome", taille: "sm" } : { taille: "lg" }),
          "cursor-pointer",
          envoi && "pointer-events-none opacity-50"
        )}
      >
        <Image size={remplacer ? 16 : 20} className="shrink-0" />
        {envoi ? "Envoi…" : remplacer ? "Remplacer le plan" : "Ajouter le plan"}
        <input type="file" accept="image/*" onChange={surSelection} className="hidden" disabled={envoi} />
      </label>
      {erreur && <p className="rounded-lg bg-rouge/10 px-3 py-2 text-sm text-rouge">{erreur}</p>}
    </div>
  );
}
