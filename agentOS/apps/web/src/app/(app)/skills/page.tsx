"use client";

import { useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { SkillLibraryBrowser } from "@/components/skills/SkillLibraryBrowser";
import { useAllSkills, useSkillCategories } from "@/hooks/useSkills";

export default function SkillsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const {
    data: categories,
    isLoading: catLoading,
    isError: catError,
    error: catErr,
    refetch: refetchCat,
  } = useSkillCategories();
  const {
    data: skills,
    isLoading: skLoading,
    isError: skError,
    error: skErr,
    refetch: refetchSk,
  } = useAllSkills();

  const setCategory = useCallback(
    (slug: string | null) => {
      const p = new URLSearchParams(searchParams.toString());
      if (slug) p.set("category", slug);
      else p.delete("category");
      const q = p.toString();
      router.replace(q ? `/skills?${q}` : "/skills", { scroll: false });
    },
    [router, searchParams]
  );

  useEffect(() => {
    if (!categoryParam || !categories?.length) return;
    const ok = categories.some((c) => c.slug === categoryParam);
    if (!ok) setCategory(null);
  }, [categoryParam, categories, setCategory]);

  const loading = catLoading || skLoading;
  const failed = catError || skError;

  return (
    <>
      <Topbar title="Skill library" />
      <main className="p-4 lg:p-8">
        <p className="mb-6 max-w-2xl text-sm text-white/55">
          Browse pre-built AI specialists by department. Each includes a production-ready system prompt you can
          edit after selection.
        </p>
        {loading ? (
          <p className="text-sm text-white/40">Loading library…</p>
        ) : failed ? (
          <div className="rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-error">
            <p className="font-medium">Could not load the skill library</p>
            <p className="mt-1 text-xs text-white/60">
              {(catErr as Error)?.message ?? (skErr as Error)?.message ?? "Check that the API is running and you are signed in."}
            </p>
            <button
              type="button"
              className="mt-3 rounded-lg border border-border px-3 py-1.5 text-xs text-white hover:bg-white/5"
              onClick={() => {
                void refetchCat();
                void refetchSk();
              }}
            >
              Retry
            </button>
          </div>
        ) : !categories || !skills ? (
          <p className="text-sm text-white/40">No data.</p>
        ) : (
          <>
            <div className="mb-4 lg:hidden">
              <label className="mb-1 block font-mono text-xs text-white/40">Department</label>
              <select
                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                value={categoryParam ?? ""}
                onChange={(e) => setCategory(e.target.value || null)}
              >
                <option value="">All specialists</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <SkillLibraryBrowser
              categories={categories}
              skills={skills}
              categorySlug={categoryParam}
              onCategoryChange={setCategory}
            />
          </>
        )}
      </main>
    </>
  );
}
