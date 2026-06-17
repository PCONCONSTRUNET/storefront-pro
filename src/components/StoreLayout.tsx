import type { ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { StoreHeader } from "./StoreHeader";
import { BottomNav } from "./BottomNav";
import { StoreFooter } from "./StoreFooter";

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
      <main key={path} className="flex-1 animate-page-in flex flex-col">
        <div className="flex-1 pb-12">
          {children}
        </div>
        <StoreFooter />
      </main>
      <BottomNav />
    </div>
  );
}
