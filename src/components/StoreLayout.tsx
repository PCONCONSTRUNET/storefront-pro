import type { ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { StoreHeader } from "./StoreHeader";
import { BottomNav } from "./BottomNav";

export function StoreLayout({
  children,
  header,
}: {
  children: ReactNode;
  header?: ReactNode;
}) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {header !== undefined ? header : <StoreHeader />}
      <main key={path} className="flex-1 pb-24 md:pb-12 animate-page-in">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
