"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { DepartmentGrid } from "@/components/departments/DepartmentGrid";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import { useDepartments } from "@/hooks/useDepartments";

export default function DepartmentsIndexPage() {
  const { data: departments, isLoading, isError, error, refetch } = useDepartments();

  return (
    <>
      <Topbar title="Departments" />
      <main className="space-y-6 p-4 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-2xl text-sm text-white/55">
            Browse teams and agents by department. Each department has its own specialists and workflows.
          </p>
          <Button type="button" className="gap-2" asChild>
            <Link href="/tasks/new">
              <Plus className="h-4 w-4" />
              New Task
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-white/50">Loading departments…</p>
        ) : isError ? (
          <div className="rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-error">
            <p className="font-medium">Could not load departments</p>
            <p className="mt-1 text-xs text-white/60">
              {(error as Error)?.message ?? "Check that the API is running and you are signed in."}
            </p>
            <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => void refetch()}>
              Retry
            </Button>
          </div>
        ) : departments?.length ? (
          <DepartmentGrid departments={departments} />
        ) : (
          <p className="text-sm text-white/50">
            No departments in the database. From the repo root run{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">
              npm run db:deploy
            </code>{" "}
            then{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">
              npm run db:seed
            </code>{" "}
            (ensure Postgres is up and <code className="font-mono text-xs">apps/api/.env</code> has{" "}
            <code className="font-mono text-xs">DATABASE_URL</code>).
          </p>
        )}
      </main>
    </>
  );
}
