"use client";

import { useEffect, useState, type ReactNode } from "react";
import { CircleCheck, Download, EllipsisVertical, Share, SquarePlus, type Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { EVENEMENT_INSTALLATION } from "@/lib/installation";
import { cn } from "@/lib/utils";

/** Événement `beforeinstallprompt` de Chrome (pas encore dans les types du DOM). */
interface InvitationInstallation extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    __invitationInstallation?: InvitationInstallation | null;
    __appliInstallee?: boolean;
  }
}

type Plateforme = "iphone" | "android" | "ordinateur";

interface EtatInstallation {
  plateforme: Plateforme;
  /** Ouverte depuis l'icône de l'écran d'accueil (ou installée à l'instant). */
  installee: boolean;
  /** Navigateur intégré de Facebook, Messenger, Instagram : l'installation y est impossible. */
  navigateurIntegre: boolean;
  /** Chrome propose l'installation en un geste (Android, ordinateur). */
  invitation: InvitationInstallation | null;
}

function lireEtat(): EtatInstallation {
  const ua = navigator.userAgent;
  // Les iPad récents se présentent comme un Mac : on les reconnaît à l'écran tactile.
  const iphone = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return {
    plateforme: iphone ? "iphone" : /Android/i.test(ua) ? "android" : "ordinateur",
    installee:
      !!window.__appliInstallee ||
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true,
    navigateurIntegre: /FBAN|FBAV|FB_IAB|FBIOS|Instagram|Messenger/i.test(ua),
    invitation: window.__invitationInstallation ?? null,
  };
}

function useInstallation() {
  // null tant que la page n'est pas affichée dans le navigateur (rien à rendre côté serveur).
  const [etat, setEtat] = useState<EtatInstallation | null>(null);

  useEffect(() => {
    const actualiser = () => setEtat(lireEtat());
    actualiser();
    window.addEventListener(EVENEMENT_INSTALLATION, actualiser);
    return () => window.removeEventListener(EVENEMENT_INSTALLATION, actualiser);
  }, []);

  async function installer() {
    const invitation = window.__invitationInstallation;
    if (!invitation) return;
    try {
      await invitation.prompt();
      const { outcome } = await invitation.userChoice;
      if (outcome === "accepted") window.__appliInstallee = true;
    } catch {
      // Invitation périmée : on affichera les gestes à faire à la place.
    }
    // Une invitation ne sert qu'une fois : Chrome en renverra une si on refuse.
    window.__invitationInstallation = null;
    // Prévient toutes les copies du composant (carte Paramètres et entrée du menu).
    window.dispatchEvent(new Event(EVENEMENT_INSTALLATION));
  }

  return { etat, installer };
}

/** Petite icône dans le texte, pour montrer le bouton à toucher. */
function IconeTexte({ icone: IconeAffichee }: { icone: Icon }) {
  return <IconeAffichee size={16} className="mx-0.5 inline-block align-[-3px]" />;
}

function Gras({ clair, children }: { clair: boolean; children: ReactNode }) {
  return <strong className={cn("font-semibold", clair ? "text-white" : "text-encre")}>{children}</strong>;
}

/** Gestes à faire quand le navigateur ne propose pas l'installation en un geste. */
function Etapes({ etat, clair = false }: { etat: EtatInstallation; clair?: boolean }) {
  const Fort = ({ children }: { children: ReactNode }) => <Gras clair={clair}>{children}</Gras>;
  const texte = cn("text-sm leading-relaxed", clair ? "text-white/70" : "text-encre/70");
  const liste = cn(texte, "flex list-decimal flex-col gap-1.5 pl-5");

  if (etat.navigateurIntegre) {
    return (
      <p className={texte}>
        Vous êtes dans le navigateur de Facebook ou Messenger, qui ne permet pas l'installation. Ouvrez son menu en haut à droite, choisissez{" "}
        <Fort>« Ouvrir dans le navigateur »</Fort>, puis revenez ici.
      </p>
    );
  }

  if (etat.plateforme === "iphone") {
    return (
      <ol className={liste}>
        <li>
          Dans <Fort>Safari</Fort>, touchez <IconeTexte icone={Share} /> <Fort>Partager</Fort> (en bas de l'écran, ou dans le menu à trois points sur les
          iPhone récents).
        </li>
        <li>
          Choisissez <IconeTexte icone={SquarePlus} /> <Fort>« Sur l'écran d'accueil »</Fort>, puis <Fort>Ajouter</Fort>.
        </li>
      </ol>
    );
  }

  if (etat.plateforme === "android") {
    return (
      <div className="flex flex-col gap-2.5">
        <ol className={liste}>
          <li>
            Dans <Fort>Chrome</Fort>, touchez le menu <IconeTexte icone={EllipsisVertical} /> en haut à droite.
          </li>
          <li>
            Choisissez <Fort>« Installer l'application »</Fort> (ou « Ajouter à l'écran d'accueil »), puis confirmez.
          </li>
        </ol>
        <p className={cn("text-xs leading-relaxed", clair ? "text-white/60" : "text-encre/60")}>
          L'option n'apparaît pas ? L'appli est peut-être déjà installée : cherchez l'icône DevisEtanche. Sinon, certains téléphones bloquent les icônes de
          sites web sur l'écran d'accueil ; DevisEtanche reste utilisable dans Chrome.
        </p>
      </div>
    );
  }

  return (
    <p className={texte}>
      Dans <Fort>Chrome</Fort> ou <Fort>Edge</Fort>, cliquez sur l'icône d'installation à droite de la barre d'adresse.
    </p>
  );
}

/** Carte « Installer l'appli » de la page Paramètres. */
export default function InstallerAppli({ className }: { className?: string }) {
  const { etat, installer } = useInstallation();
  if (!etat) return null;

  return (
    <Card className={cn("p-5", className)}>
      <CardHeader titre="Installer l'appli" sousTitre="L'icône DevisEtanche sur votre écran d'accueil, sans passer par le Play Store ni l'App Store." />
      {etat.installee ? (
        <p className="flex items-center gap-2 text-sm font-medium text-emerald-700">
          <CircleCheck size={18} className="shrink-0" />
          DevisEtanche est installée sur cet appareil.
        </p>
      ) : etat.invitation ? (
        <Button taille="lg" pleineLargeur icone={Download} onClick={installer}>
          Installer DevisEtanche
        </Button>
      ) : (
        <Etapes etat={etat} />
      )}
    </Card>
  );
}

/** Entrée « Installer l'appli » du menu, pour tous les rôles ; disparaît une fois l'appli installée. */
export function InstallerAppliMenu() {
  const { etat, installer } = useInstallation();
  const [aideOuverte, setAideOuverte] = useState(false);
  if (!etat || etat.installee) return null;

  return (
    <div>
      <button
        type="button"
        onClick={() => (etat.invitation ? installer() : setAideOuverte((ouverte) => !ouverte))}
        aria-expanded={etat.invitation ? undefined : aideOuverte}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
      >
        <Download size={19} className="shrink-0" />
        Installer l'appli
      </button>
      {aideOuverte && !etat.invitation && (
        <div className="mx-1 mb-2 mt-1 rounded-xl bg-white/5 p-3">
          <Etapes etat={etat} clair />
        </div>
      )}
    </div>
  );
}
