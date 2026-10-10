"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Map as IconePlan, X } from "@/components/icons";
import { Button, classesBouton } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/Progress";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { envoyerPhoto } from "@/lib/photos";
import { infoStatut, ORDRE_STATUTS_ZONE, TONS } from "@/lib/statuts";
import { cn } from "@/lib/utils";
import { changerStatutZone } from "@/lib/zones";
import type { Zone } from "../types";

/**
 * Panneau d'une zone : feuille qui monte du bas de l'écran sur téléphone,
 * colonne à droite du plan sur ordinateur.
 */
export default function PanneauZone({
  chantierId,
  zone,
  onFermer,
  onRedessiner,
}: {
  chantierId: string;
  zone: Zone;
  onFermer: () => void;
  onRedessiner: () => void;
}) {
  const [statut, setStatut] = useState(zone.statut);
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; texte: string } | null>(null);
  const router = useRouter();

  // La touche Échap ferme le panneau (ordinateur).
  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => e.key === "Escape" && onFermer();
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, [onFermer]);

  async function changerStatut(nouveau: string) {
    if (nouveau === statut) return;
    const precedent = statut;
    setStatut(nouveau);
    setMessage(null);
    const erreur = await changerStatutZone(zone.id, nouveau);
    if (erreur) {
      setStatut(precedent);
      setMessage({ ok: false, texte: erreur });
      return;
    }
    router.refresh();
  }

  async function surPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    e.target.value = "";
    if (!fichier) return;
    setMessage(null);
    setEnvoi(true);
    const resultat = await envoyerPhoto(chantierId, fichier, zone.id);
    setEnvoi(false);
    setMessage("erreur" in resultat ? { ok: false, texte: resultat.erreur } : { ok: true, texte: "Photo ajoutée à la zone." });
    if (!("erreur" in resultat)) router.refresh();
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-marine/40 backdrop-blur-[2px] lg:hidden" onClick={onFermer} aria-hidden="true" />
      <section
        aria-label={`Zone ${zone.nom}`}
        className={cn(
          "card fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col gap-4 overflow-y-auto rounded-b-none p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]",
          "lg:static lg:z-auto lg:max-h-none lg:self-start lg:rounded-b-2xl lg:pb-5"
        )}
      >
        <div className="mx-auto -mt-2 h-1.5 w-10 rounded-full bg-ligne lg:hidden" aria-hidden="true" />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-encre">{zone.nom}</h2>
            <p className="text-sm text-encre/60">{zone.surface_m2 ?? 0} m²</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <StatusBadge domaine="zone" statut={statut} />
            <Button variante="fantome" icone={X} onClick={onFermer} aria-label="Fermer" className="w-10 px-0" />
          </div>
        </div>

        <ProgressBar valeur={statut === "termine" ? 100 : zone.avancement_pct ?? 0} ton={infoStatut("zone", statut).ton} afficherValeur />

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-encre/50">Statut</p>
          <div className="grid grid-cols-2 gap-2">
            {ORDRE_STATUTS_ZONE.map((s) => {
              const { label, ton } = infoStatut("zone", s);
              const actif = s === statut;
              return (
                <Button key={s} taille="lg" variante={actif ? "primaire" : "secondaire"} aria-pressed={actif} onClick={() => changerStatut(s)}>
                  <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-surface", TONS[ton].point)} aria-hidden="true" />
                  {label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* <label> plutôt que <Button> : c'est lui qui ouvre l'appareil photo. */}
        <label className={cn(classesBouton({ variante: "secondaire", taille: "lg", pleineLargeur: true }), "cursor-pointer", envoi && "pointer-events-none opacity-50")}>
          <Camera size={20} className="shrink-0" />
          {envoi ? "Envoi de la photo…" : "Photo de cette zone"}
          <input type="file" accept="image/*" capture="environment" onChange={surPhoto} className="hidden" disabled={envoi} />
        </label>
        <Button variante="fantome" taille="lg" icone={IconePlan} pleineLargeur onClick={onRedessiner}>
          Redessiner sur le plan
        </Button>

        {message && (
          <p role="status" className={message.ok ? "rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700" : "rounded-lg bg-rouge/10 px-3 py-2 text-sm text-rouge"}>
            {message.texte}
          </p>
        )}
      </section>
    </>
  );
}
