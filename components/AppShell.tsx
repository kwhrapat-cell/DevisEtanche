"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import React from "react";

const ROUTES_SANS_SIDEBAR = ["/", "/login","/signup", "/espace-client"];

export default function AppShell({ children }: {children: React.ReactNode }) {
  const pathname = usePathname();

  const sansSidebar = ROUTES_SANS_SIDEBAR.some( (route) =>
    route === "/" ? pathname === "/" : pathname?.startsWith(route)
  );

  if (sansSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div> 
  );
}