/**
 * Tests du moteur de calcul (lib/calc/etancheite.ts).
 *
 * Lancés avec le testeur intégré de Node (`npm test`), sans dépendance à installer.
 * Ils fixent les règles de chiffrage actuelles : si l'une change par erreur,
 * la vérification automatique de la PR échoue avant que le devis ne soit faux.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculerEtancheite,
  pertesDuSysteme,
  reglagesPertesEntreprise,
  REGLAGES_PERTES_PAR_DEFAUT,
} from "../lib/calc/etancheite.ts";

test("bicouche 100 m² avec périmètre connu : membrane, relevés, primaire", () => {
  const r = calculerEtancheite({ surface: 100, perimetre: 40, systeme: "bicouche", isolation: false });
  assert.equal(r.nombreCouches, 2); // première couche + finition : le devis compte les deux
  assert.equal(r.surfaceMembrane, 108); // par couche : 8 % de recouvrements
  assert.equal(r.metresReleves, 40);
  assert.equal(r.surfaceReleves, 6); // 40 ml × 0,15 m (relevé mini)
  assert.equal(r.primaireAccrochage, 34.2); // (108 + 6) m² × 0,3 L/m²
  assert.equal(r.fixationsMecaniques, 0); // soudé en plein
  assert.equal(r.isolantSurface, 0);
  assert.equal(r.protectionGravillon, 0);
  assert.equal(r.detailsSysteme.reference, "DTU 43.1 / 43.4");
});

test("PVC 300 m² isolé, gravillons, périmètre estimé", () => {
  const r = calculerEtancheite({
    surface: 300,
    systeme: "pvc",
    isolation: true,
    epaisseurIsolant: 120,
    protectionLourde: true,
  });
  assert.equal(r.nombreCouches, 1);
  assert.equal(r.metresReleves, 80); // √300 × 4 × 1,15 ≈ 79,7 → 80 ml
  assert.equal(r.surfaceMembrane, 318); // 6 % de recouvrements
  assert.equal(r.surfaceReleves, 12);
  assert.equal(r.primaireAccrochage, 0); // PVC fixé mécaniquement : pas de primaire
  assert.equal(r.fixationsMecaniques, 1050); // 3,5 fixations/m²
  assert.equal(r.isolantSurface, 309); // + 3 % de chutes
  assert.equal(r.isolantVolume, 37.08); // 309 m² × 0,12 m
  assert.equal(r.protectionGravillon, 24000); // 5 cm par défaut × 1 600 kg/m³ = 80 kg/m²
});

test("gravillons : le poids suit l'épaisseur choisie", () => {
  const gravillons = (epaisseurGravillonsCm: number) =>
    calculerEtancheite({ surface: 100, perimetre: 40, systeme: "bicouche", isolation: false, protectionLourde: true, epaisseurGravillonsCm }).protectionGravillon;
  assert.equal(gravillons(4), 6400); // 100 m² × 0,04 m × 1 600 kg/m³
  assert.equal(gravillons(5), 8000);
  assert.equal(gravillons(0), 0);
});

test("résine liquide : 5 % de pertes, pas de fixation", () => {
  const r = calculerEtancheite({ surface: 200, perimetre: 60, systeme: "resine", isolation: false });
  assert.equal(r.nombreCouches, 1);
  assert.equal(r.surfaceMembrane, 210);
  assert.equal(r.fixationsMecaniques, 0);
  assert.equal(r.detailsSysteme.reference, "NF DTU 43.6 / Avis Technique");
});

test("hauteur de relevé personnalisée", () => {
  const r = calculerEtancheite({ surface: 100, perimetre: 40, hauteurReleves: 0.3, systeme: "bicouche", isolation: false });
  assert.equal(r.surfaceReleves, 12);
});

test("évacuations EP : 2 au minimum, puis une par tranche de 300 m²", () => {
  const evac = (surface: number) => calculerEtancheite({ surface, perimetre: 100, systeme: "bicouche", isolation: false }).evacuationsEP;
  assert.equal(evac(50), 2);
  assert.equal(evac(600), 2);
  assert.equal(evac(650), 3);
  assert.equal(evac(1200), 4);
});

test("surface vide ou négative : aucun matériau compté", () => {
  for (const surface of [0, -50, Number.NaN]) {
    const r = calculerEtancheite({ surface, perimetre: 10, systeme: "bicouche", isolation: true, protectionLourde: true });
    assert.equal(r.surfaceMembrane, 0);
    assert.equal(r.isolantSurface, 0);
    assert.equal(r.protectionGravillon, 0);
  }
});

test("pertes de l'entreprise : elles remplacent la valeur usuelle du système", () => {
  const base = { surface: 100, perimetre: 40, systeme: "bicouche" as const, isolation: false };
  assert.equal(calculerEtancheite(base).surfaceMembrane, 108); // 8 % par défaut
  const r = calculerEtancheite({ ...base, pertes: 0.12 });
  assert.equal(r.surfaceMembrane, 112);
  assert.equal(r.detailsSysteme.pertes, 0.12); // le résultat affiche la valeur réellement utilisée
  assert.equal(r.primaireAccrochage, 35.4); // (112 + 6) m² × 0,3 L/m²
  assert.equal(calculerEtancheite({ ...base, pertes: 0 }).surfaceMembrane, 100);
});

test("pertes hors limites ou illisibles : la valeur usuelle s'applique", () => {
  const base = { surface: 100, perimetre: 40, systeme: "bicouche" as const, isolation: false };
  for (const pertes of [-0.05, 0.8, Number.NaN]) {
    assert.equal(calculerEtancheite({ ...base, pertes }).surfaceMembrane, 108);
  }
});

test("réglages lus dans la table entreprises", () => {
  // Migration pas encore exécutée : aucune colonne, valeurs usuelles.
  assert.deepEqual(reglagesPertesEntreprise({ devise: "XPF" }), REGLAGES_PERTES_PAR_DEFAUT);
  assert.deepEqual(reglagesPertesEntreprise(null), { recouvrementBicouchePct: 8, recouvrementPvcPct: 6, pertesResinePct: 5, chuteRouleauxPct: 10 });
  // Valeurs réglées (Postgres peut renvoyer un texte pour une colonne numeric).
  const r = reglagesPertesEntreprise({ recouvrement_bicouche_pct: "7.5", recouvrement_pvc_pct: 4, pertes_resine_pct: null, chute_rouleaux_pct: 60 });
  assert.equal(r.recouvrementBicouchePct, 7.5);
  assert.equal(r.recouvrementPvcPct, 4);
  assert.equal(r.pertesResinePct, 5); // vide : valeur usuelle
  assert.equal(r.chuteRouleauxPct, 10); // 60 % refusé : valeur usuelle
  assert.equal(pertesDuSysteme("bicouche", r), 0.075);
  assert.equal(pertesDuSysteme("pvc", r), 0.04);
  assert.equal(pertesDuSysteme("resine", r), 0.05);
});
