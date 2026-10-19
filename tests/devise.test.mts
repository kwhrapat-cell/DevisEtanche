/**
 * Tests des montants (lib/devise.ts) : parité XPF/€ et affichage.
 * Une erreur ici fausserait tous les devis d'un facteur ~119.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { PARITE_XPF_PAR_EUR, convertirEurVersDevise, formatMontant } from "../lib/devise.ts";

/** Intl met des espaces insécables fines entre les milliers : on les normalise pour comparer. */
const espaces = (texte: string) => texte.replace(/\s/g, " ");

test("parité fixe : 1 000 XPF = 8,38 €", () => {
  assert.equal(Math.round(1000 / PARITE_XPF_PAR_EUR * 100) / 100, 8.38);
});

test("conversion d'un prix catalogue en euros", () => {
  assert.equal(convertirEurVersDevise(100, "EUR"), 100);
  assert.equal(convertirEurVersDevise(100, "XPF"), 11933);
  assert.equal(convertirEurVersDevise(29), 3461); // XPF par défaut
});

test("affichage des montants", () => {
  assert.equal(espaces(formatMontant(1234.5, "EUR")), "1 234,50 €");
  assert.equal(espaces(formatMontant(119331.74, "XPF")), "119 332 XPF");
  assert.equal(espaces(formatMontant(0)), "0 XPF");
});
