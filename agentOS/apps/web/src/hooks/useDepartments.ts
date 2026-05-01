"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data } = await api.get("/api/departments");
      return data as {
        id: string;
        name: string;
        slug: string;
        description: string;
        icon: string;
        color: string;
        _count: { agents: number };
      }[];
    },
  });
}

export function useDepartment(slug: string) {
  return useQuery({
    queryKey: ["department", slug],
    queryFn: async () => {
      const { data } = await api.get(`/api/departments/${slug}`);
      return data as {
        id: string;
        name: string;
        slug: string;
        description: string;
        icon: string;
        color: string;
        agents: {
          id: string;
          name: string;
          role: string;
          description: string;
          nextAgent: { id: string; name: string } | null;
          _count: { knowledgeDocs: number };
        }[];
      };
    },
    enabled: !!slug,
  });
}
