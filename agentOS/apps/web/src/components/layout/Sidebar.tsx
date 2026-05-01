"use client";

import {
  Building2,
  ClipboardList,
  LayoutDashboard,
  Library,
  Menu,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/appStore";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/departments", label: "Departments", icon: Building2 },
  { href: "/skills", label: "Skill Library", icon: Library },
  { href: "/agents/new", label: "New Agent", icon: Users },
  { href: "/tasks", label: "Tasks", icon: ClipboardList },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  return (
    <>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-60 border-r border-border bg-surface transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center border-b border-border px-4 font-mono text-sm font-semibold text-accent">
          AgentOS
        </div>
        <nav className="space-y-1 p-3">
          {links.map((l) => {
            const Icon = l.icon;
            const active = pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-accent/15 text-accent"
                    : "text-white/70 hover:bg-white/5"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="h-4 w-4" />
                {l.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="fixed left-3 top-3 z-50 lg:hidden">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>
    </>
  );
}
