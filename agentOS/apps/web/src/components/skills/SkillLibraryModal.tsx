"use client";

import { useDeferredValue, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SkillCard } from "./SkillCard";
import type { SkillCategoryRow, SkillListItem } from "@/hooks/useSkills";
import { useSkillLibraryStore } from "@/store/skillLibraryStore";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: SkillCategoryRow[];
  skills: SkillListItem[];
  onPickSkill: (skill: SkillListItem) => void;
};

export function SkillLibraryModal({
  open,
  onOpenChange,
  categories,
  skills,
  onPickSkill,
}: Props) {
  const searchQuery = useSkillLibraryStore((s) => s.searchQuery);
  const setSearchQuery = useSkillLibraryStore((s) => s.setSearchQuery);
  const deferredSearch = useDeferredValue(searchQuery.toLowerCase().trim());
  const [cat, setCat] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return skills.filter((s) => {
      if (cat && s.category.slug !== cat) return false;
      if (!deferredSearch) return true;
      const hay = `${s.title} ${s.subtitle} ${s.description} ${s.tags.join(" ")}`.toLowerCase();
      return hay.includes(deferredSearch);
    });
  }, [skills, cat, deferredSearch]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-5xl flex-col gap-0 overflow-hidden p-0 sm:rounded-xl">
        <DialogHeader className="border-b border-border p-4 pb-3">
          <DialogTitle>Skill library</DialogTitle>
          <p className="text-xs text-white/50">Pick a pre-built specialist — prompts load automatically.</p>
          <Input
            className="mt-3"
            placeholder="Search…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </DialogHeader>
        <div className="flex min-h-0 flex-1">
          <div className="hidden w-44 shrink-0 border-r border-border p-2 sm:block">
            <button
              type="button"
              onClick={() => setCat(null)}
              className={cn(
                "w-full rounded-lg px-2 py-1.5 text-left text-xs",
                !cat ? "bg-accent/20 text-accent" : "text-white/60 hover:bg-white/5"
              )}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCat(c.slug)}
                className={cn(
                  "mt-1 w-full rounded-lg px-2 py-1.5 text-left text-xs",
                  cat === c.slug ? "bg-accent/20 text-accent" : "text-white/60 hover:bg-white/5"
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {filtered.map((s) => (
                <SkillCard
                  key={s.id}
                  skill={s}
                  onUse={(sk) => {
                    onPickSkill(sk);
                    onOpenChange(false);
                  }}
                />
              ))}
            </div>
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-white/50">No matches.</p>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
