"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type IsoNavActive = "floor" | "dashboard" | "tasks" | "skills" | "none";

export function IsoWorkspaceNav({
  active,
  suiteHint,
}: {
  active: IsoNavActive;
  suiteHint?: string;
}) {
  const pathname = usePathname();

  return (
    <header className="iso-nav">
      <div className="flex flex-wrap items-center gap-3">
        <div className="iso-nav-brand">AGENTOS</div>
        {suiteHint ? (
          <span className="rounded-full border border-sky-400/50 bg-sky-500/15 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-sky-200">
            {suiteHint}
          </span>
        ) : null}
      </div>
      <nav className="iso-nav-links" aria-label="Workspace navigation">
        <Link href="/dashboard" data-active={active === "dashboard" || pathname === "/dashboard" ? "true" : "false"}>
          Dashboard
        </Link>
        <Link href="/departments" data-active={active === "floor" ? "true" : "false"}>
          Floor map
        </Link>
        <Link href="/tasks" data-active={active === "tasks" ? "true" : "false"}>
          Tasks
        </Link>
        <Link href="/skills" data-active={active === "skills" ? "true" : "false"}>
          Skills
        </Link>
      </nav>
    </header>
  );
}
