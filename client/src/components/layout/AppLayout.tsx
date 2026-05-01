import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-full overflow-hidden bg-nexus-bg text-nexus-text">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[length:28px_28px] bg-grid-pattern opacity-30"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-scanlines opacity-[0.015]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[420px] bg-gradient-to-b from-white/95 to-transparent"
        aria-hidden
      />
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="relative flex-1 px-4 pb-12 pt-16 md:px-10 md:pt-8">
          <div className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full aurora" />
          <div className="pointer-events-none absolute right-4 top-16 h-80 w-80 rounded-full aurora opacity-60" />
          {children}
        </main>
      </div>
    </div>
  );
}
