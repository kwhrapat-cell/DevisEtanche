"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import BottomNav from "./BottomNav";
import Sidebar from "./Sidebar";
import { SidebarProvider } from "./SidebarContext";

const ROUTES_SANS_SIDEBAR = [
  "/",
  "/login",
  "/signup",
  "/espace-client",
  "/completer-profil",
  "/mot-de-passe-oublie",
  "/reinitialiser-mot-de-passe",
  "/rejoindre-chantier",
  "/mentions-legales",
  "/cgv",
  "/confidentialite",
];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const sansSidebar = ROUTES_SANS_SIDEBAR.some((route) => (route === "/" ? pathname === "/" : pathname?.startsWith(route)));

  if (sansSidebar) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        {/* pb-24 sur téléphone : laisse la place à la barre du bas. */}
        <main className="min-w-0 flex-1 pb-24 md:pb-8">{children}</main>
      </div>
      <BottomNav />
    </SidebarProvider>
  );
}
