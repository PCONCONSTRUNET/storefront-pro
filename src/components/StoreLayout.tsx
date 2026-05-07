import type { ReactNode } from "react";
import { StoreHeader } from "./StoreHeader";
import { BottomNav } from "./BottomNav";

export function StoreLayout({ children, header }: { children: ReactNode; header?: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {header !== undefined ? header : <StoreHeader />}
      <main className="flex-1 pb-24 md:pb-12">{children}</main>
      <BottomNav />
    </div>
  );
}

