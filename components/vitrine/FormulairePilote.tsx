"use client";

import { useEffect, useRef, useState } from "react";
import { CircleCheck } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { COMPANY_INFO } from "@/lib/company-info";

type Etat = "saisie" | "envoi" | "envoyee" | "erreur";

const champ = "h-12 w-full rounded-xl border border-ligne bg-surface px-3 text-base text-encre";

/**
 * Formulaire « Devenir entreprise pilote » de la page d'accueil publique.
 * Envoie la demande à /api/demande-pilote, qui l'enregistre dans Supabase.
 * La provenance (?source=… ou ?utm_source=… dans l'adresse) est jointe à la demande,
 * pour savoir quel canal amène les prospects (LinkedIn, devis, espace client…).
 */
export default function FormulairePilote() {
  const [etat, setEtat] = useState<Etat>("saisie");
  const [erreur, setErreur] = useState<string | null>(null);
  const ouvertLe = useRef(0);

  useEffect(() => {
    ouvertLe.current = Date.now();
  }, []);

  async function envoyer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur(null);
    setEtat("envoi");
    const donnees = new FormData(e.currentTarget);
    const adresse = new URLSearchParams(window.location.search);
    try {
      const reponse = await fetch("/api/demande-pilote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: donnees.get("nom"),
          entreprise: donnees.get("entreprise"),
          contact: donnees.get("contact"),
          message: donnees.get("message"),
          site_web: donnees.get("site_web"),
          source: adresse.get("source") ?? adresse.get("utm_source"),
          duree_ms: Date.now() - ouvertLe.current,
        }),
      });
      const resultat = await reponse.json().catch(() => ({}));
      if (!reponse.ok) throw new Error(resultat.erreur ?? "");
      setEtat("envoyee");
    } catch (err) {
      setErreur(err instanceof Error && err.message ? err.message : null);
      setEtat("erreur");
    }
  }

  if (etat === "envoyee") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-ligne bg-surface p-5" role="status">
        <CircleCheck size={24} className="mt-0.5 shrink-0 text-emerald-700" />
        <div>
          <p className="font-semibold text-encre">Demande envoyée.</p>
          <p className="mt-1 text-sm text-encre/70">Patrice vous recontacte pour convenir d'un premier rendez-vous sur l'un de vos chantiers.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={envoyer} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-encre">
          Votre nom
          <input name="nom" required minLength={2} maxLength={120} autoComplete="name" className={champ} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-encre">
          Entreprise
          <input name="entreprise" required minLength={2} maxLength={160} autoComplete="organization" className={champ} />
        </label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-encre">
        Téléphone ou e-mail
        <input name="contact" required minLength={5} maxLength={160} inputMode="text" className={champ} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-encre">
        <span>
          Un mot sur vos chantiers <span className="font-normal text-encre/60">(facultatif)</span>
        </span>
        <textarea
          name="message"
          rows={3}
          maxLength={2000}
          placeholder="Ex. : 4 compagnons, surtout des toitures-terrasses de logements"
          className="w-full rounded-xl border border-ligne bg-surface px-3 py-2.5 text-base text-encre"
        />
      </label>
      {/* Piège à robots : invisible pour un humain, ignoré par les lecteurs d'écran. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Site web
          <input name="site_web" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {etat === "erreur" && (
        <p className="rounded-xl bg-rouge/10 px-3 py-2.5 text-sm text-rouge" role="alert">
          {erreur ?? "La demande n'est pas partie."} Vous pouvez aussi écrire à{" "}
          <a href={`mailto:${COMPANY_INFO.email}?subject=${encodeURIComponent("Entreprise pilote DevisEtanche")}`} className="font-medium underline">
            {COMPANY_INFO.email}
          </a>
          .
        </p>
      )}

      <Button type="submit" variante="marque" taille="lg" pleineLargeur disabled={etat === "envoi"} className="sm:w-auto sm:self-start">
        {etat === "envoi" ? "Envoi…" : "Envoyer ma demande"}
      </Button>
    </form>
  );
}
