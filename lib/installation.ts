/**
 * Installation de DevisEtanche sur l'écran d'accueil (« PWA »).
 *
 * Chrome annonce qu'il peut installer l'appli par l'événement `beforeinstallprompt`,
 * parfois avant que React soit prêt. Ce petit script, placé dans le <head> du
 * layout, le met de côté dans `window.__invitationInstallation` ; le composant
 * `InstallerAppli` le reprend quand on touche « Installer ».
 *
 * Fichier sans "use client" exprès : le layout (Server Component) doit pouvoir
 * importer la chaîne elle-même.
 */
export const EVENEMENT_INSTALLATION = "devisetanche:installation";

export const SCRIPT_INSTALLATION = `(function () {
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    window.__invitationInstallation = e;
    window.dispatchEvent(new Event("${EVENEMENT_INSTALLATION}"));
  });
  window.addEventListener("appinstalled", function () {
    window.__invitationInstallation = null;
    window.__appliInstallee = true;
    window.dispatchEvent(new Event("${EVENEMENT_INSTALLATION}"));
  });
})();`;
