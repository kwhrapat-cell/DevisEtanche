import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ardoise: { DEFAULT: "#0E2038", 2: "#152B4A" },
        bitume: "#12141A",
        rouille: { DEFAULT: "#E2622B", 2: "#1D4ED8" },
        papier: "#F7F4EC",
        sable: "#EDE7DA",
        vert: "#2F9E5B",
        ambre: "#D9A441",
        ligne: "#DDD5C2",
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
