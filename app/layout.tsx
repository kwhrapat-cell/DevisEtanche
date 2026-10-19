import type { Metadata, Viewport } from "next";
import "./globals.css";
import OfflineBanner from "@/components/OfflineBanner";
import RegisterSW from "@/components/RegisterSW";
import AppShell from "@/components/AppShell";
import { SCRIPT_INSTALLATION } from "@/lib/installation";
import { COMPANY_INFO } from "@/lib/company-info";

export const metadata: Metadata = {
  // Adresse de base des images d'aperçu (og.png) quand un lien est partagé.
  metadataBase: new URL(COMPANY_INFO.siteUrl),
  title: "DevisEtanche — Application",
  description: "Le logiciel des chantiers d'étanchéité, du métré à la réception.",
  applicationName: "DevisEtanche",
  // iPhone : nom et icône une fois ajoutée à l'écran d'accueil (Safari → Partager).
  appleWebApp: { capable: true, title: "DevisEtanche", statusBarStyle: "default" },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png?v=2", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png?v=2", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png?v=2", sizes: "180x180" }],
  },
};

// Couleur de la barre d'état du téléphone dans l'appli installée (= fond de page).
export const viewport: Viewport = { themeColor: "#F4F6FA" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        {/* use-credentials : le manifeste se charge aussi sur les previews Vercel protégées. */}
        <link rel="manifest" href="/manifest.json" crossOrigin="use-credentials" />
        {/* Garde l'invitation « Installer » de Chrome, qui peut arriver avant que la page soit prête. */}
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_INSTALLATION }} />
      </head>
      <body>
        <OfflineBanner />
        <RegisterSW />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
