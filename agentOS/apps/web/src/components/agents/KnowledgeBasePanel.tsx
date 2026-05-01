"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function KnowledgeBasePanel({ agentId }: { agentId: string }) {
  const qc = useQueryClient();
  const { data: docs } = useQuery({
    queryKey: ["knowledge", agentId],
    queryFn: async () => {
      const { data } = await api.get(`/api/agents/${agentId}/knowledge`);
      return data as {
        id: string;
        title: string;
        sourceType: string;
        createdAt: string;
      }[];
    },
    enabled: !!agentId,
  });

  const del = useMutation({
    mutationFn: async (docId: string) => {
      await api.delete(`/api/knowledge/${docId}`);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["knowledge", agentId] });
    },
  });

  return (
    <ul className="space-y-2">
      {docs?.map((d) => (
        <li
          key={d.id}
          className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2"
        >
          <div>
            <p className="text-sm text-white">{d.title}</p>
            <Badge variant="muted" className="mt-1">
              {d.sourceType}
            </Badge>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => del.mutate(d.id)}
          >
            <Trash2 className="h-4 w-4 text-error" />
          </Button>
        </li>
      ))}
    </ul>
  );
}
