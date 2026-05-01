"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { DepartmentSuiteView } from "@/components/departments/DepartmentSuiteView";
import { Button } from "@/components/ui/button";
import { useDepartment, useDepartments } from "@/hooks/useDepartments";

function SuiteWithParams() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: dept, isLoading, isError, error, refetch } = useDepartment(slug);
  const { data: allDepartments } = useDepartments();

  const allDeptLabels = useMemo(() => {
    const m: Record<string, string> = {};
    for (const d of allDepartments ?? []) m[d.slug] = d.name;
    return m;
  }, [allDepartments]);

  if (isLoading) {
    return (
      <>
        <Topbar title="Department" />
        <main className="p-4 lg:p-8">
          <p className="text-sm text-white/50">Loading…</p>
        </main>
      </>
    );
  }

  if (isError || !dept) {
    return (
      <>
        <Topbar title="Department" />
        <main className="p-4 lg:p-8">
          <div className="rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-error">
            <p className="font-medium">Could not load this department</p>
            <p className="mt-1 text-xs text-white/60">{(error as Error)?.message ?? "It may not exist."}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
                Retry
              </Button>
              <Button type="button" variant="ghost" size="sm" asChild>
                <Link href="/departments">Floor map</Link>
              </Button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Topbar title={dept.name} />
      <main className="p-4 lg:p-8">
        <DepartmentSuiteView slug={slug} dept={dept} allDeptLabels={allDeptLabels} />
      </main>
    </>
  );
}

export default function DepartmentPage() {
  return (
    <Suspense
      fallback={
        <>
          <Topbar title="Department" />
          <main className="p-4 lg:p-8">
            <p className="text-sm text-white/50">Loading…</p>
          </main>
        </>
      }
    >
      <SuiteWithParams />
    </Suspense>
  );
}
