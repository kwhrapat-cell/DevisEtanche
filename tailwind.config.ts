import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Thème sombre bleu marine — ardoise reste réservée aux surfaces foncées
        // (sidebar, panneaux d'accent) toujours utilisées avec du texte clair ;
        // le texte courant utilise "neige" sur les fonds "papier"/"sable"/.card.
        ardoise: { DEFAULT: "#0B1830", 2: "#132A4C" },
        bitume: "#050810",
        rouille: { DEFAULT: "#2E6BEE", 2: "#5B9DFF" },
        papier: "#070C16",
        sable: "#101B30",
        vert: "#34D399",
        ambre: "#FBBF24",
        ligne: "#1E2A44",
        neige: "#EAF0FB",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'IBM Plex Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      borderRadius: {
        xl2: "18px",
      },
    },
  },
  plugins: [],
};
export default config;
