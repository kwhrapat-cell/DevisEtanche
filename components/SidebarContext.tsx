"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface SidebarState {
  ouvert: boolean;
  setOuvert: (v: boolean) => void;
}

const SidebarContext = createContext<SidebarState | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [ouvert, setOuvert] = useState(false);
  return <SidebarContext.Provider value={{ ouvert, setOuvert }}>{children}</SidebarContext.Provider>;
}

export function useSidebar(): SidebarState {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar doit être utilisé sous SidebarProvider");
  return ctx;
}
