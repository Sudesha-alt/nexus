"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { SkillCard } from "./SkillCard";
import { SkillDrawer } from "./SkillDrawer";
import type { SkillCategoryRow, SkillListItem } from "@/hooks/useSkills";
import { useSkillLibraryStore } from "@/store/skillLibraryStore";
import { cn } from "@/lib/utils";

type Props = {
  categories: SkillCategoryRow[];
  skills: SkillListItem[];
  categorySlug: string | null;
  onCategoryChange: (slug: string | null) => void;
};

export function SkillLibraryBrowser({
  categories,
  skills,
  categorySlug,
  onCategoryChange,
}: Props) {
  const searchQuery = useSkillLibraryStore((s) => s.searchQuery);
  const setSearchQuery = useSkillLibraryStore((s) => s.setSearchQuery);
  const deferredSearch = useDeferredValue(searchQuery.toLowerCase().trim());
  const [drawerSkill, setDrawerSkill] = useState<SkillListItem | null>(null);

  const filtered = useMemo(() => {
    return skills.filter((s) => {
      if (categorySlug && s.category.slug !== categorySlug) return false;
      if (!deferredSearch) return true;
      const hay = `${s.title} ${s.subtitle} ${s.description} ${s.tags.join(" ")}`.toLowerCase();
      return hay.includes(deferredSearch);
    });
  }, [skills, categorySlug, deferredSearch]);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] gap-6">
      <aside className="hidden w-52 shrink-0 lg:block">
        <p className="mb-2 font-mono text-xs text-white/40">Departments</p>
        <nav className="space-y-1">
          <button
            type="button"
            onClick={() => onCategoryChange(null)}
            className={cn(
              "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
              !categorySlug ? "bg-accent/20 text-accent" : "text-white/70 hover:bg-white/5"
            )}
          >
            All specialists
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onCategoryChange(c.slug)}
              className={cn(
                "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                categorySlug === c.slug ? "bg-accent/20 text-accent" : "text-white/70 hover:bg-white/5"
              )}
            >
              <span className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                {c.name}
              </span>
              <span className="mt-0.5 block font-mono text-[10px] text-white/35">
                {c._count.skills} skills
              </span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            placeholder="Search by title, tag, or description…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-16 text-center">
            <p className="text-white/60">
              No specialists found for &quot;{searchQuery || "this filter"}&quot;. Try searching by tag or
              department.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((s) => (
              <SkillCard key={s.id} skill={s} onUse={setDrawerSkill} />
            ))}
          </div>
        )}
      </div>

      <SkillDrawer skill={drawerSkill} open={!!drawerSkill} onOpenChange={(o) => !o && setDrawerSkill(null)} />
    </div>
  );
}
