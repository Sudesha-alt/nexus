"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { IsoWorkspaceNav } from "@/components/departments/isometric/IsoWorkspaceNav";
import { TopDownFloorPlan } from "@/components/departments/isometric/TopDownFloorPlan";
import { Button } from "@/components/ui/button";
import { roomFootprintPath, ROOM_FOOTPRINT, TOPDOWN_VIEW_H, TOPDOWN_VIEW_W } from "@/data/isometricFloor";
import { useDepartments } from "@/hooks/useDepartments";
import { FLOOR_BAY_SET, FLOOR_BAY_SLUGS, departmentFill } from "@/lib/floorLayout";
import { departmentAccent } from "@/lib/utils";
import { mergeDeptTasks, useDepartmentTaskStore } from "@/stores/departmentTaskStore";
import "@/styles/isometric-floor.css";

export default function DepartmentsFloorPage() {
  const router = useRouter();
  const { data: departments, isLoading, isError, error, refetch } = useDepartments();
  const rawByDept = useDepartmentTaskStore((s) => s.byDept);
  const tasksByDept = useMemo(() => mergeDeptTasks(rawByDept), [rawByDept]);

  const deptLabels = useMemo(() => {
    const m: Record<string, string> = {};
    for (const d of departments ?? []) m[d.slug] = d.name;
    for (const slug of FLOOR_BAY_SLUGS) {
      if (!m[slug]) m[slug] = slug.replace(/-/g, " ");
    }
    return m;
  }, [departments]);

  const otherDepts = useMemo(
    () => (departments ?? []).filter((d) => !FLOOR_BAY_SET.has(d.slug)),
    [departments]
  );

  return (
    <>
      <Topbar title="Departments" />
      <main className="p-4 lg:p-8">
        <IsoWorkspaceNav active="floor" />

        {isLoading ? (
          <p className="text-sm text-white/50">Loading departments…</p>
        ) : isError ? (
          <div className="rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-error">
            <p className="font-medium">Could not load departments</p>
            <p className="mt-1 text-xs text-white/60">{(error as Error)?.message}</p>
            <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => void refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <motion.div
            className="iso-page iso-page-dots"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-xl">
                <p className="mb-1 inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-sky-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-500 shadow-[0_0_8px_#0ea5e9]" aria-hidden />
                  Orchestration wing · Level 02
                </p>
                <h1 className="iso-hero-title">Office floor plan</h1>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  <strong className="font-semibold text-slate-800">Top-down view</strong> — each bay maps to an AgentOS
                  department. The hub is shared circulation. Click a room to open its suite;{" "}
                  <span className="whitespace-nowrap font-mono text-[11px] text-slate-700">open tasks</span> from the
                  local task panel show as a badge on on-floor bays.
                </p>
              </div>
              <aside className="iso-legend w-full shrink-0 lg:max-w-[230px]" aria-label="Department color legend">
                <h3>On-floor key</h3>
                {FLOOR_BAY_SLUGS.map((slug) => (
                  <div key={slug} className="iso-legend-row">
                    <span className="iso-footprint-mini" title={deptLabels[slug]}>
                      <svg viewBox="0 0 32 22" width={40} height={26} aria-hidden>
                        <path
                          d={roomFootprintPath(ROOM_FOOTPRINT[slug] ?? "chamfer", 1.5, 1.5, 29, 19)}
                          fill={departmentFill(slug)}
                          stroke="#0f172a"
                          strokeWidth={1.2}
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-800">
                      {deptLabels[slug]}
                    </span>
                  </div>
                ))}
              </aside>
            </div>

            <nav aria-label="Breadcrumb" className="iso-breadcrumb mb-5">
              <ol className="flex flex-wrap items-center gap-1.5">
                <li>
                  <Link href="/dashboard">Dashboard</Link>
                </li>
                <li aria-hidden className="text-slate-400">
                  /
                </li>
                <li className="font-semibold text-slate-800">Floor map</li>
              </ol>
            </nav>

            <div className="mx-auto w-full max-w-5xl">
              <TopDownFloorPlan
                onRoom={(slug) => router.push(`/departments/${slug}`)}
                tasksByDept={tasksByDept}
                deptLabels={deptLabels}
              />
            </div>

            {otherDepts.length > 0 ? (
              <section className="mx-auto mt-10 w-full max-w-5xl">
                <p className="iso-section-kicker text-slate-600">Also on this campus</p>
                <p className="mb-4 text-sm text-slate-600">
                  These departments are not drawn on the six-bay floor — open their suites directly.
                </p>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {otherDepts.map((d) => (
                    <li key={d.id}>
                      <Link
                        href={`/departments/${d.slug}`}
                        className="iso-card flex flex-col gap-2 p-4 transition hover:-translate-y-0.5"
                        style={{ borderLeftWidth: 4, borderLeftColor: departmentAccent(d.slug) }}
                      >
                        <span className="font-semibold text-slate-900">{d.name}</span>
                        <span className="line-clamp-2 text-xs text-slate-600">{d.description}</span>
                        <span className="font-mono text-[10px] text-sky-700">Open suite →</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <p className="mx-auto mt-6 max-w-5xl font-mono text-[9px] text-slate-500">
              Floor SVG viewBox {TOPDOWN_VIEW_W}×{TOPDOWN_VIEW_H} · AgentOS departments
            </p>
          </motion.div>
        )}
      </main>
    </>
  );
}
