"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { DepartmentGrid } from "@/components/departments/DepartmentGrid";
import { Topbar } from "@/components/layout/Topbar";
import { SkillQuickStartRow } from "@/components/skills/SkillQuickStartRow";
import { useAllSkills } from "@/hooks/useSkills";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDepartments } from "@/hooks/useDepartments";
import { useStats, useTasks } from "@/hooks/useTasks";

export default function DashboardPage() {
  const { data: stats } = useStats();
  const { data: departments } = useDepartments();
  const { data: tasks } = useTasks();
  const { data: allSkills } = useAllSkills();

  const recent = tasks?.slice(0, 10) ?? [];

  return (
    <>
      <Topbar title="Command Center" />
      <main className="space-y-8 p-4 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {[
            ["Total Agents", stats?.totalAgents ?? "—"],
            ["Active Tasks", stats?.activeTasks ?? "—"],
            ["Departments", stats?.departments ?? "—"],
            ["Completed", stats?.tasksCompleted ?? "—"],
          ].map(([k, v]) => (
            <Card key={k}>
              <CardContent className="pt-4">
                <p className="font-mono text-xs text-white/50">{k}</p>
                <p className="mt-1 font-sans text-2xl font-semibold text-white">
                  {v}
                </p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <SkillQuickStartRow skills={allSkills} />

        <section id="dept-grid">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-sans text-lg font-semibold">Departments</h2>
            <Button type="button" className="gap-2" asChild>
              <Link href="/tasks/new">
                <Plus className="h-4 w-4" />
                New Task
              </Link>
            </Button>
          </div>
          {departments ? <DepartmentGrid departments={departments} /> : null}
        </section>

        <section>
          <h2 className="mb-4 font-sans text-lg font-semibold">Recent Tasks</h2>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface font-mono text-xs text-white/50">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Agent</th>
                  <th className="p-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((t) => (
                  <tr key={t.id} className="border-b border-border/60 hover:bg-white/5">
                    <td className="p-3">
                      <Link href={`/tasks/${t.id}`} className="text-accent hover:underline">
                        {t.title}
                      </Link>
                    </td>
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
                    <td className="p-3 font-mono text-xs">{t.firstAgent.name}</td>
                    <td className="p-3 font-mono text-xs text-white/50">
                      {new Date(t.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <Link
          href="/tasks/new"
          className="fixed bottom-6 right-6 z-30 flex h-14 items-center gap-2 rounded-full bg-accent px-6 font-medium text-white shadow-lift transition hover:opacity-90 lg:bottom-8 lg:right-8"
        >
          <Plus className="h-5 w-5" />
          New Task
        </Link>
      </main>
    </>
  );
}
