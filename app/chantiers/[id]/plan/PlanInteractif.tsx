"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck, Plus, Undo2, X } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { infoStatut, ORDRE_STATUTS_ZONE, TONS } from "@/lib/statuts";
import { cn } from "@/lib/utils";
import { enregistrerContour, type Point } from "@/lib/zones";
import type { Zone } from "../types";
import ChoixPlanButton from "./ChoixPlanButton";
import PanneauZone from "./PanneauZone";

/** Coordonnées du SVG : 0–100 dans les deux sens, étirées sur l'image du plan. */
const versSvg = (points: Point[]) => points.map(([x, y]) => `${x * 100},${y * 100}`).join(" ");

const centre = (points: Point[]): Point => [
  points.reduce((s, [x]) => s + x, 0) / points.length,
  points.reduce((s, [, y]) => s + y, 0) / points.length,
];

/**
 * Plan interactif : l'image du plan avec les zones dessinées dessus, colorées
 * selon leur statut. Toucher une zone ouvre son panneau ; « Placer » une zone
 * passe en mode dessin (on touche le plan pour poser ses coins).
 */
export default function PlanInteractif({
  chantierId,
  planUrl,
  zones,
  peutChangerPlan,
}: {
  chantierId: string;
  planUrl: string;
  zones: Zone[];
  peutChangerPlan: boolean;
}) {
  const [selection, setSelection] = useState<string | null>(null);
  const [dessin, setDessin] = useState<{ zoneId: string; points: Point[] } | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const surface = useRef<SVGSVGElement>(null);
  const router = useRouter();

  const placees = zones.filter((z) => z.contour && z.contour.length >= 3 && z.id !== dessin?.zoneId);
  const aPlacer = zones.filter((z) => !z.contour || z.contour.length < 3);
  const zoneSelectionnee = zones.find((z) => z.id === selection) ?? null;
  const zoneDessinee = zones.find((z) => z.id === dessin?.zoneId);

  function commencerDessin(zoneId: string) {
    setSelection(null);
    setErreur(null);
    setDessin({ zoneId, points: [] });
    surface.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function ajouterPoint(e: React.MouseEvent<SVGSVGElement>) {
    if (!dessin || !surface.current) return;
    const cadre = surface.current.getBoundingClientRect();
    const borner = (v: number) => Math.min(1, Math.max(0, v));
    const point: Point = [borner((e.clientX - cadre.left) / cadre.width), borner((e.clientY - cadre.top) / cadre.height)];
    setDessin({ ...dessin, points: [...dessin.points, point] });
  }

  async function terminerDessin() {
    if (!dessin) return;
    setEnregistrement(true);
    const message = await enregistrerContour(dessin.zoneId, dessin.points);
    setEnregistrement(false);
    if (message) {
      setErreur(message);
      return;
    }
    setSelection(dessin.zoneId);
    setDessin(null);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
      <Card className="p-3 sm:p-5 lg:col-span-2">
        <CardHeader
          titre="Plan"
          sousTitre={dessin ? undefined : "Touchez une zone pour voir son détail."}
          className="px-2 pt-2 sm:px-0 sm:pt-0"
          action={peutChangerPlan && !dessin && <ChoixPlanButton chantierId={chantierId} remplacer />}
        />

        {dessin && (
          <div className="mb-3 flex flex-col gap-3 rounded-xl bg-primaire/10 p-3">
            <p className="text-sm text-encre">
              Touchez le plan pour poser les coins de <strong>« {zoneDessinee?.nom} »</strong>, dans l'ordre (3 minimum).{" "}
              <span className="text-encre/60">
                {dessin.points.length} point{dessin.points.length > 1 ? "s" : ""}
              </span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variante="secondaire"
                taille="lg"
                icone={Undo2}
                disabled={dessin.points.length === 0}
                onClick={() => setDessin({ ...dessin, points: dessin.points.slice(0, -1) })}
              >
                Défaire
              </Button>
              <Button variante="secondaire" taille="lg" icone={X} onClick={() => setDessin(null)}>
                Annuler
              </Button>
              <Button taille="lg" icone={CircleCheck} className="col-span-2" disabled={dessin.points.length < 3 || enregistrement} onClick={terminerDessin}>
                {enregistrement ? "Enregistrement…" : "Enregistrer la zone"}
              </Button>
            </div>
          </div>
        )}
        {erreur && <p className="mb-3 rounded-lg bg-rouge/10 px-3 py-2 text-sm text-rouge">{erreur}</p>}

        <div className={cn("relative select-none overflow-hidden rounded-xl border border-ligne", dessin && "ring-2 ring-primaire")}>
          <img src={planUrl} alt="Plan du chantier" className="block h-auto w-full" draggable={false} />
          <svg
            ref={surface}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className={cn("absolute inset-0 h-full w-full", dessin && "cursor-crosshair")}
            onClick={dessin ? ajouterPoint : () => setSelection(null)}
          >
            {placees.map((z) => {
              const { hex } = TONS[infoStatut("zone", z.statut).ton];
              const active = z.id === selection;
              return (
                <polygon
                  key={z.id}
                  points={versSvg(z.contour!)}
                  fill={hex}
                  fillOpacity={active ? 0.5 : 0.3}
                  stroke={hex}
                  strokeWidth={active ? 4 : 2}
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  role="button"
                  aria-label={`Zone ${z.nom}`}
                  className={dessin ? "pointer-events-none" : "cursor-pointer"}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelection(z.id);
                  }}
                />
              );
            })}
            {dessin && dessin.points.length > 0 && (
              <polygon
                points={versSvg(dessin.points)}
                fill={TONS.info.hex}
                fillOpacity={dessin.points.length >= 3 ? 0.2 : 0}
                stroke={TONS.info.hex}
                strokeWidth={2}
                strokeDasharray="6 4"
                vectorEffect="non-scaling-stroke"
                className="pointer-events-none"
              />
            )}
          </svg>

          {/* Noms des zones et coins en cours de dessin : en HTML pour ne pas être déformés par le SVG étiré. */}
          {placees.map((z) => {
            const [x, y] = centre(z.contour!);
            return (
              <span
                key={z.id}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-surface/90 px-1.5 py-0.5 text-xs font-semibold text-encre shadow-carte"
                style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
              >
                {z.nom}
              </span>
            );
          })}
          {dessin?.points.map(([x, y], i) => (
            <span
              key={i}
              className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primaire ring-2 ring-surface"
              style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
            />
          ))}
        </div>

        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 px-2 sm:px-0">
          {ORDRE_STATUTS_ZONE.map((s) => {
            const { label, ton } = infoStatut("zone", s);
            return (
              <li key={s} className="flex items-center gap-1.5 text-xs text-encre/70">
                <span className={cn("h-2.5 w-2.5 rounded-full", TONS[ton].point)} aria-hidden="true" />
                {label}
              </li>
            );
          })}
        </ul>

        {!dessin && aPlacer.length > 0 && (
          <div className="mt-4 border-t border-ligne px-2 pt-4 sm:px-0">
            <p className="mb-2 text-sm font-medium text-encre">Zones à placer sur le plan</p>
            <div className="flex flex-wrap gap-2">
              {aPlacer.map((z) => (
                <Button key={z.id} variante="secondaire" icone={Plus} onClick={() => commencerDessin(z.id)}>
                  {z.nom}
                </Button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {zoneSelectionnee ? (
        <PanneauZone
          key={zoneSelectionnee.id}
          chantierId={chantierId}
          zone={zoneSelectionnee}
          onFermer={() => setSelection(null)}
          onRedessiner={() => commencerDessin(zoneSelectionnee.id)}
        />
      ) : (
        <Card className="hidden p-5 lg:block">
          <CardHeader titre="Détail de la zone" sousTitre="Touchez une zone du plan pour voir son statut, changer son avancement ou prendre une photo." />
        </Card>
      )}
    </div>
  );
}
