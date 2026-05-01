"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SkillListItem } from "@/hooks/useSkills";

const FEATURED_CATEGORY_SLUGS = [
  "engineering",
  "product",
  "sales",
  "marketing",
  "hr",
  "finance",
] as const;

type Props = {
  skills: SkillListItem[] | undefined;
};

export function SkillQuickStartRow({ skills }: Props) {
  const featured = useMemo(() => {
    if (!skills?.length) return [];
    return FEATURED_CATEGORY_SLUGS.map((slug) => {
      const inCat = skills.filter((s) => s.category.slug === slug);
      inCat.sort((a, b) => a.sortOrder - b.sortOrder);
      return inCat[0];
    }).filter(Boolean) as SkillListItem[];
  }, [skills]);

  if (!featured.length) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-sans text-lg font-semibold">Start with a pre-built AI specialist</h2>
          <p className="mt-1 text-sm text-white/45">One featured role per major department — full prompts included.</p>
        </div>
        <Button type="button" variant="outline" size="sm" asChild>
          <Link href="/skills">Browse all</Link>
        </Button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 pt-1 scrollbar-thin">
        {featured.map((s) => (
          <Card
            key={s.id}
            className="min-w-[240px] max-w-[260px] shrink-0 border-border/80"
            style={{ borderTopWidth: 3, borderTopColor: s.category.color }}
          >
            <CardContent className="p-4">
              <p className="font-mono text-[10px] text-white/40">{s.category.name}</p>
              <h3 className="mt-1 font-sans text-sm font-semibold text-white">{s.title}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-white/50">{s.subtitle}</p>
              <Button type="button" className="mt-3 w-full" size="sm" asChild>
                <Link href={`/agents/new?skillId=${s.id}`}>Create Agent</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
