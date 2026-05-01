"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import * as Icons from "lucide-react";
import type { ComponentType } from "react";
import { motion } from "framer-motion";
import { AgentCard } from "@/components/agents/AgentCard";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import { departmentAccent } from "@/lib/utils";
import { useDepartment } from "@/hooks/useDepartments";

export default function DepartmentPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: dept, isLoading, isError, error, refetch } = useDepartment(slug);

  const Icon = dept
    ? ((Icons as unknown as Record<string, ComponentType<{ className?: string }>>)[
        dept.icon
      ] ?? Icons.Building2)
    : Icons.Building2;
  const hex = departmentAccent(slug);

  return (
    <>
      <Topbar title={dept?.name ?? "Department"} />
      <main className="space-y-6 p-4 lg:p-8">
        {isLoading ? (
          <p className="text-sm text-white/50">Loading…</p>
        ) : isError || !dept ? (
          <div className="rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-error">
            <p className="font-medium">Could not load this department</p>
            <p className="mt-1 text-xs text-white/60">
              {(error as Error)?.message ?? "It may not exist or the API request failed."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
                Retry
              </Button>
              <Button type="button" variant="ghost" size="sm" asChild>
                <Link href="/departments">All departments</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-start justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${hex}22`, color: hex }}
                >
                  <Icon className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="font-sans text-2xl font-bold">{dept.name}</h1>
                  <p className="mt-2 max-w-2xl text-sm text-white/60">
                    {dept.description}
                  </p>
                </div>
              </div>
              <Button type="button" asChild>
                <Link href={`/agents/new?department=${dept.id}`}>Add Agent</Link>
              </Button>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {dept.agents.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <AgentCard agent={a} />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
