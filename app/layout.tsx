import type { Metadata, Viewport } from "next";
import "./globals.css";
import OfflineBanner from "@/components/OfflineBanner";
import RegisterSW from "@/components/RegisterSW";
import AppShell from "@/components/AppShell";
import { SCRIPT_INSTALLATION } from "@/lib/installation";

export const metadata: Metadata = {
  title: "DevisEtanche — Application",
  description: "L'écosystème des professionnels de l'étanchéité",
  applicationName: "DevisEtanche",
  // iPhone : nom et icône une fois ajoutée à l'écran d'accueil (Safari → Partager).
  appleWebApp: { capable: true, title: "DevisEtanche", statusBarStyle: "default" },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
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
