import { ReactNode } from "react";
import { BottomNav, Sidebar } from "./Navigation";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <Sidebar />
      <main className="md:pl-64 min-h-screen pb-20 md:pb-0 transition-all duration-300">
        <div className="max-w-5xl mx-auto p-4 md:p-8 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
