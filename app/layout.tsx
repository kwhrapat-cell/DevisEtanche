import type { Metadata } from "next";
import "./globals.css";
import OfflineBanner from "@/components/OfflineBanner";
import RegisterSW from "@/components/RegisterSW";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "DevisEtanche — Application",
  description: "L'écosystème des professionnels de l'étanchéité",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <OfflineBanner />
        <RegisterSW />
       <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
