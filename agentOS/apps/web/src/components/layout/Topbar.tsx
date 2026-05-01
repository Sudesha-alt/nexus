"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Topbar({ title }: { title: string }) {
  const { data } = useSession();
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur lg:pl-64">
      <h1 className="font-sans text-lg font-semibold text-white">{title}</h1>
      <div className="flex items-center gap-3">
        <span className="hidden font-mono text-xs text-white/50 sm:inline">
          {data?.user?.email}
        </span>
        <Button type="button" variant="ghost" size="sm" onClick={() => signOut()}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
