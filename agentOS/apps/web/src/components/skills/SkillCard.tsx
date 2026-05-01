"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SkillListItem } from "@/hooks/useSkills";

const difficultyStyles: Record<string, string> = {
  junior: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  intermediate: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  senior: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  principal: "bg-amber-500/15 text-amber-200 border-amber-500/40",
};

type Props = {
  skill: SkillListItem;
  onUse: (skill: SkillListItem) => void;
};

export function SkillCard({ skill, onUse }: Props) {
  const accent = skill.category.color || "#6366f1";
  const diff = skill.difficulty ?? "intermediate";
  const preview = skill.description.slice(0, 120) + (skill.description.length > 120 ? "…" : "");

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-border/80 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
      )}
      style={{ borderLeftWidth: 4, borderLeftColor: accent }}
    >
      <CardContent className="p-4 pt-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-sans text-base font-semibold text-white">{skill.title}</h3>
            <p className="mt-0.5 line-clamp-1 text-xs text-white/50">{skill.subtitle}</p>
          </div>
          <Badge className={cn("shrink-0 border text-[10px] font-mono", difficultyStyles[diff] ?? difficultyStyles.intermediate)}>
            {diff}
          </Badge>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {skill.tags.slice(0, 4).map((t) => (
            <span
              key={t}
              className="rounded-full bg-white/5 px-2 py-0.5 font-mono text-[10px] text-white/60"
            >
              {t}
            </span>
          ))}
        </div>
        <p className="mt-3 line-clamp-2 text-xs text-white/45" title={skill.description}>
          {preview}
        </p>
        <Button type="button" className="mt-4 w-full" size="sm" onClick={() => onUse(skill)}>
          Use This Skill
        </Button>
      </CardContent>
    </Card>
  );
}
