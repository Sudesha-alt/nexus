"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type SkillCategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  sortOrder: number;
  departmentId: string | null;
  department: { id: string; name: string; slug: string } | null;
  _count: { skills: number };
};

export type SkillListItem = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  systemPrompt: string;
  tags: string[];
  suggestedTools: string[];
  exampleInputs: string[];
  difficulty: string;
  sortOrder: number;
  usageCount: number;
  category: {
    id: string;
    name: string;
    slug: string;
    icon: string;
    color: string;
    department: { id: string; slug: string; name: string } | null;
  };
};

const STALE = Infinity;
const GC = 1000 * 60 * 60 * 24;

export function useSkillCategories() {
  return useQuery({
    queryKey: ["skillCategories"],
    queryFn: async () => {
      const { data } = await api.get<SkillCategoryRow[]>("/api/skills/categories");
      return data;
    },
    staleTime: STALE,
    gcTime: GC,
  });
}

export function useAllSkills() {
  return useQuery({
    queryKey: ["skills", "all"],
    queryFn: async () => {
      const { data } = await api.get<SkillListItem[]>("/api/skills");
      return data;
    },
    staleTime: STALE,
    gcTime: GC,
  });
}

export function useSkill(id: string | null) {
  return useQuery({
    queryKey: ["skill", id],
    queryFn: async () => {
      const { data } = await api.get<SkillListItem>(`/api/skills/${id}`);
      return data;
    },
    enabled: !!id,
    staleTime: STALE,
    gcTime: GC,
  });
}
