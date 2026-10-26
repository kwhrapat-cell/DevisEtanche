/**
 * Tests du paiement Lemon Squeezy (lib/lemonsqueezy.ts) : contrôle de la signature des
 * webhooks et choix du forfait. Une erreur ici donnerait un forfait payant gratuitement,
 * ou retirerait son forfait à un client qui paie.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { miseAJourForfait, signatureValide, statutDonneAcces } from "../lib/lemonsqueezy.ts";

const VARIANTES = { artisan: "111", pro: "222" };
const SECRET = "phrase-secrete-de-test";
const signer = (corps: string, secret = SECRET) => createHmac("sha256", secret).update(corps).digest("hex");

test("signature : acceptée seulement si elle correspond au contenu et au secret", () => {
  const corps = JSON.stringify({ meta: { event_name: "subscription_created" } });
  assert.equal(signatureValide(corps, signer(corps), SECRET), true);
  assert.equal(signatureValide(corps + " ", signer(corps), SECRET), false); // contenu modifié
  assert.equal(signatureValide(corps, signer(corps, "autre-secret"), SECRET), false); // mauvais secret
  assert.equal(signatureValide(corps, null, SECRET), false); // pas de signature
  assert.equal(signatureValide(corps, signer(corps), undefined), false); // secret non configuré
  assert.equal(signatureValide(corps, "abc", SECRET), false); // longueur différente
});

test("statuts qui gardent l'accès au forfait payé", () => {
  for (const statut of ["active", "on_trial", "past_due", "cancelled"]) assert.equal(statutDonneAcces(statut), true, statut);
  for (const statut of ["expired", "unpaid", "paused", undefined, null]) assert.equal(statutDonneAcces(statut), false, String(statut));
});

test("achat : l'entreprise passe au forfait de la variante payée", () => {
  const maj = miseAJourForfait({ id: "9", status: "active", variant_id: 222, customer_id: 77 }, "subscription_created", null, VARIANTES);
  assert.deepEqual(maj, { forfait: "pro", paiement_abonnement_id: "9", paiement_client_id: "77", paiement_statut: "active" });
});

test("résiliation : le forfait reste jusqu'à la fin du mois payé, puis retour à Découverte", () => {
  const resilie = miseAJourForfait({ id: "9", status: "cancelled", variant_id: 111 }, "subscription_cancelled", "9", VARIANTES);
  assert.equal(resilie?.forfait, "artisan");
  const termine = miseAJourForfait({ id: "9", status: "expired", variant_id: 111 }, "subscription_expired", "9", VARIANTES);
  assert.equal(termine?.forfait, "decouverte");
});

test("changement d'Artisan à Pro sur le même abonnement", () => {
  const maj = miseAJourForfait({ id: "9", status: "active", variant_id: 222 }, "subscription_updated", "9", VARIANTES);
  assert.equal(maj?.forfait, "pro");
});

test("un autre produit de la boutique ne touche pas au forfait", () => {
  assert.equal(miseAJourForfait({ id: "9", status: "active", variant_id: 999 }, "subscription_created", null, VARIANTES), null);
});

test("la fin d'un ancien abonnement ne retire pas le forfait de l'abonnement en cours", () => {
  // L'entreprise paie l'abonnement 10 ; l'ancien abonnement 9 expire.
  assert.equal(miseAJourForfait({ id: "9", status: "expired", variant_id: 111 }, "subscription_expired", "10", VARIANTES), null);
  // Un nouvel achat, lui, remplace l'abonnement enregistré.
  const nouveau = miseAJourForfait({ id: "11", status: "active", variant_id: 222 }, "subscription_created", "10", VARIANTES);
  assert.equal(nouveau?.paiement_abonnement_id, "11");
  assert.equal(nouveau?.forfait, "pro");
});
