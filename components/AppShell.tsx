"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { SidebarProvider } from "./SidebarContext";
import React from "react";

const ROUTES_SANS_SIDEBAR = [
  "/",
  "/login",
  "/signup",
  "/espace-client",
  "/completer-profil",
  "/mot-de-passe-oublie",
  "/reinitialiser-mot-de-passe",
  "/rejoindre-chantier",
];

export default function AppShell({ children }: {children: React.ReactNode }) {
  const pathname = usePathname();

  const sansSidebar = ROUTES_SANS_SIDEBAR.some( (route) =>
    route === "/" ? pathname === "/" : pathname?.startsWith(route)
  );

  if (sansSidebar) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </SidebarProvider>
  );
}