"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { updateAgentSchema, type UpdateAgentInput } from "@agentos/shared";
import { AgentChainBuilder } from "@/components/agents/AgentChainBuilder";
import { KnowledgeBasePanel } from "@/components/agents/KnowledgeBasePanel";
import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useAgent, useAgents, useUpdateChain } from "@/hooks/useAgents";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function AgentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: agent, isLoading } = useAgent(id);
  const { data: allAgents } = useAgents();
  const qc = useQueryClient();
  const updateChain = useUpdateChain(id);

  const { register, handleSubmit, watch, setValue } = useForm<UpdateAgentInput>({
    resolver: zodResolver(updateAgentSchema),
    values: agent
      ? {
          name: agent.name,
          role: agent.role,
          description: agent.description,
          systemPrompt: agent.systemPrompt,
          isActive: agent.isActive,
        }
      : undefined,
  });

  const save = useMutation({
    mutationFn: async (body: UpdateAgentInput) => {
      const { data } = await api.put(`/api/agents/${id}`, body);
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["agent", id] });
    },
  });

  const [file, setFile] = useState<File | null>(null);

  const uploadKb = useMutation({
    mutationFn: async () => {
      if (!file) return;
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", file.name);
      await api.post(`/api/agents/${id}/knowledge`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["knowledge", id] });
      setFile(null);
    },
  });

  if (isLoading || !agent) {
    return (
      <>
        <Topbar title="Agent" />
        <main className="p-8 text-sm text-white/50">Loading…</main>
      </>
    );
  }

  return (
    <>
      <Topbar title={agent.name} />
      <main className="space-y-6 p-4 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-accent">{agent.role}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="muted">{agent.department.name}</Badge>
              <Badge variant={agent.isActive ? "success" : "error"}>
                {agent.isActive ? "active" : "inactive"}
              </Badge>
            </div>
          </div>
          <Button type="button" variant="outline" asChild>
            <Link href={`/agents/${id}/edit`}>Edit</Link>
          </Button>
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
            <TabsTrigger value="chain">Chain</TabsTrigger>
            <TabsTrigger value="history">Run history</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <form
              className="max-w-3xl space-y-4"
              onSubmit={handleSubmit((b) => save.mutate(b))}
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={!!watch("isActive")}
                  onChange={(e) => setValue("isActive", e.target.checked)}
                />
                <Label htmlFor="active">Active</Label>
              </div>
              <div>
                <Label>Name</Label>
                <Input className="mt-1" {...register("name")} />
              </div>
              <div>
                <Label>Role</Label>
                <Input className="mt-1" {...register("role")} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea className="mt-1" {...register("description")} />
              </div>
              <div>
                <Label>System prompt</Label>
                <Textarea
                  className="mt-1 min-h-[200px] font-mono text-xs"
                  {...register("systemPrompt")}
                />
              </div>
              <Button type="submit" disabled={save.isPending}>
                Save
              </Button>
            </form>
            {agent.stats ? (
              <p className="mt-4 font-mono text-xs text-white/50">
                Runs: {agent.stats.stepsRun} · Avg tokens:{" "}
                {agent.stats.avgTokens?.toFixed(0) ?? "—"}
              </p>
            ) : null}
          </TabsContent>
          <TabsContent value="knowledge" className="space-y-4">
            <div className="flex flex-wrap items-end gap-2">
              <div>
                <Label>Upload</Label>
                <Input
                  type="file"
                  className="mt-1"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <Button
                type="button"
                disabled={!file || uploadKb.isPending}
                onClick={() => uploadKb.mutate()}
              >
                Upload
              </Button>
            </div>
            <KnowledgeBasePanel agentId={id} />
          </TabsContent>
          <TabsContent value="chain">
            <div className="max-w-md space-y-4">
              <AgentChainBuilder
                agents={allAgents?.map((a) => ({ id: a.id, name: a.name })) ?? []}
                selfId={id}
                value={agent.nextAgentId ?? null}
                onChange={(next) => updateChain.mutate(next)}
              />
            </div>
          </TabsContent>
          <TabsContent value="history">
            <ul className="space-y-2 font-mono text-xs">
              {agent.runHistory?.map(
                (r: {
                  id: string;
                  task: { title: string; id: string };
                  status: string;
                  stepNumber: number;
                }) => (
                  <li key={r.id} className="rounded-lg border border-border p-2">
                    <Link href={`/tasks/${r.task.id}`} className="text-accent">
                      {r.task.title}
                    </Link>{" "}
                    · step {r.stepNumber} · {r.status}
                  </li>
                )
              )}
            </ul>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
