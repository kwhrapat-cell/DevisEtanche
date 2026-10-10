import type { Config } from "tailwindcss";

// Les couleurs sont définies une seule fois, en variables CSS dans app/globals.css.
// Ici on ne fait que les exposer à Tailwind — l'opacité (`text-encre/60`) fonctionne.
const v = (nom: string) => `rgb(var(--${nom}) / <alpha-value>)`;

const policeTexte = ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"];

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        fond: v("fond"), // fond de page (gris très clair)
        surface: v("surface"), // cartes, panneaux, champs
        sable: v("sable"), // surface atténuée (survol, pistes de barres)
        ligne: v("ligne"), // bordures et séparateurs
        encre: v("encre"), // texte courant
        marine: { DEFAULT: v("marine"), 2: v("marine-2") }, // sidebar, bandeaux foncés
        primaire: { DEFAULT: v("primaire"), 2: v("primaire-2") }, // actions principales
        accent: v("accent"), // orange de la marque
        vert: v("vert"),
        ambre: v("ambre"),
        rouge: v("rouge"),
      },
      fontFamily: {
        sans: policeTexte,
        body: policeTexte,
        display: policeTexte,
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xl2: "18px",
      },
      boxShadow: {
        carte: "0 1px 2px rgb(15 27 45 / 0.04), 0 1px 3px rgb(15 27 45 / 0.06)",
        flottant: "0 8px 24px rgb(15 27 45 / 0.14)",
      },
    },
  },
  plugins: [],
};
export default config;
