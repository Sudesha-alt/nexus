"use client";

import Link from "next/link";
import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/hooks/useTasks";

export default function TasksPage() {
  const [filter, setFilter] = useState<string>("all");
  const { data: tasks } = useTasks(filter);

  return (
    <>
      <Topbar title="Task history" />
      <main className="space-y-4 p-4 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {(["all", "running", "completed", "failed"] as const).map((f) => (
              <Button
                key={f}
                type="button"
                variant={filter === f ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f}
              </Button>
            ))}
          </div>
          <Button type="button" asChild>
            <Link href="/tasks/new">New task</Link>
          </Button>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface font-mono text-xs text-white/50">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Agent</th>
                <th className="p-3">Dept</th>
                <th className="p-3">Steps</th>
                <th className="p-3">Status</th>
                <th className="p-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {tasks?.map((t) => (
                <tr key={t.id} className="border-b border-border/60 hover:bg-white/5">
                  <td className="p-3">
                    <Link href={`/tasks/${t.id}`} className="text-accent hover:underline">
                      {t.title}
                    </Link>
                  </td>
                  <td className="p-3 font-mono text-xs">{t.firstAgent.name}</td>
                  <td className="p-3 text-xs">{t.firstAgent.department.name}</td>
                  <td className="p-3 font-mono text-xs">{t._count.steps}</td>
                  <td className="p-3">
                    <Badge
                      variant={
                        t.status === "completed"
                          ? "success"
                          : t.status === "failed"
                            ? "error"
                            : "default"
                      }
                    >
                      {t.status}
                    </Badge>
                  </td>
                  <td className="p-3 font-mono text-[10px] text-white/50">
                    {new Date(t.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
