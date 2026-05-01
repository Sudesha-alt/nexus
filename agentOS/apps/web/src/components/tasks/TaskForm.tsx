"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { createTaskSchema, type CreateTaskInput } from "@agentos/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAgents } from "@/hooks/useAgents";
import { useCreateTask } from "@/hooks/useTasks";

function buildChain(
  startId: string,
  agents: { id: string; name: string; nextAgentId: string | null }[]
): string[] {
  const names: string[] = [];
  let id: string | null = startId;
  const seen = new Set<string>();
  while (id && !seen.has(id)) {
    seen.add(id);
    const a = agents.find((x) => x.id === id);
    if (!a) break;
    names.push(a.name);
    id = a.nextAgentId;
  }
  return names;
}

export function TaskForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preAgent = searchParams.get("agent");
  const { data: agents } = useAgents();
  const createTask = useCreateTask();

  const { register, handleSubmit, watch } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      firstAgentId: preAgent ?? "",
    },
  });

  const firstId = watch("firstAgentId");
  const chain = useMemo(() => {
    if (!agents || !firstId) return [];
    return buildChain(firstId, agents);
  }, [agents, firstId]);

  return (
    <form
      className="mx-auto max-w-xl space-y-4"
      onSubmit={handleSubmit(async (data) => {
        const t = await createTask.mutateAsync(data);
        router.push(`/tasks/${t.id}`);
      })}
    >
      <div>
        <Label htmlFor="title">Task title</Label>
        <Input id="title" className="mt-1" {...register("title")} />
      </div>
      <div>
        <Label htmlFor="description">CEO brief</Label>
        <Textarea id="description" className="mt-1" {...register("description")} />
      </div>
      <div>
        <Label>Starting agent</Label>
        <select
          className="mt-1 flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
          {...register("firstAgentId")}
        >
          <option value="">Select…</option>
          {agents?.map((a) => (
            <option key={a.id} value={a.id}>
              {a.department.name} · {a.name}
            </option>
          ))}
        </select>
      </div>
      {chain.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background p-3 font-mono text-xs text-white/70">
          {chain.map((n, i) => (
            <span key={`${n}-${i}`} className="flex items-center gap-2">
              {i > 0 ? <ArrowRight className="h-3 w-3 text-accent" /> : null}
              <span>{n}</span>
            </span>
          ))}
        </div>
      ) : null}
      <div className="flex gap-2">
        <Button type="button" variant="ghost" asChild>
          <Link href="/tasks">Cancel</Link>
        </Button>
        <Button type="submit" disabled={createTask.isPending}>
          Assign task
        </Button>
      </div>
    </form>
  );
}
