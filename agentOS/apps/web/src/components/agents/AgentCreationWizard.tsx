"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { createAgentSchema, type CreateAgentInput } from "@agentos/shared";
import { AgentChainBuilder } from "./AgentChainBuilder";
import { SkillLibraryModal } from "@/components/skills/SkillLibraryModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useAgents } from "@/hooks/useAgents";
import { useDepartments } from "@/hooks/useDepartments";
import {
  useAllSkills,
  useSkill,
  useSkillCategories,
  type SkillListItem,
} from "@/hooks/useSkills";
import { cn } from "@/lib/utils";

const ROLE_SUGGESTIONS: Record<string, string[]> = {
  engineering: [
    "Backend Engineer",
    "Frontend Engineer",
    "DevOps Engineer",
    "Security Engineer",
    "ML Engineer",
    "System Architect",
  ],
  product: [
    "Product Manager",
    "UX Researcher",
    "Data Analyst",
    "Growth PM",
    "Platform PM",
  ],
  qa: [
    "Manual QA Engineer",
    "Automation QA Engineer",
    "Performance Engineer",
    "Security Tester",
  ],
  sales: ["SDR", "Account Executive", "Sales Ops", "Revenue Analyst", "Enterprise Sales"],
  marketing: [
    "Content Strategist",
    "SEO Specialist",
    "Paid Ads Manager",
    "Brand Strategist",
    "Email Marketer",
  ],
  hr: ["Recruiter", "HR Business Partner", "L&D Specialist", "Compensation Analyst"],
  finance: [
    "Financial Analyst",
    "FP&A Manager",
    "Accounts Manager",
    "Tax Specialist",
  ],
  legal: ["Contract Specialist"],
  "customer-success": ["Customer Success Manager"],
};

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function applySkillToForm(
  skill: SkillListItem,
  departments: { id: string; slug: string }[] | undefined,
  setValue: (name: keyof CreateAgentInput, value: string) => void
) {
  const dept =
    departments?.find((d) => d.id === skill.category.department?.id) ??
    departments?.find((d) => d.slug === skill.category.slug);
  if (dept) setValue("departmentId", dept.id);
  setValue("role", skill.title);
  setValue("description", skill.description);
  setValue("systemPrompt", skill.systemPrompt);
}

export function AgentCreationWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preDept = searchParams.get("department");
  const skillIdFromUrl = searchParams.get("skillId");
  const { data: session } = useSession();
  const {
    data: departments,
    isLoading: deptLoading,
    isError: deptError,
    refetch: refetchDepartments,
  } = useDepartments();
  const { data: allAgents } = useAgents();
  const {
    data: skillCategories,
    isError: catError,
    refetch: refetchCategories,
  } = useSkillCategories();
  const { data: allSkills, isError: skillsError, refetch: refetchSkills } = useAllSkills();
  const { data: urlSkill } = useSkill(skillIdFromUrl);

  const [step, setStep] = useState(0);
  const [nextAgentId, setNextAgentId] = useState<string | null>(null);
  const [kbTitle, setKbTitle] = useState("");
  const [kbText, setKbText] = useState("");
  const [kbUrl, setKbUrl] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [genLoading, setGenLoading] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(skillIdFromUrl);
  const [selectedSkillTitle, setSelectedSkillTitle] = useState<string | null>(null);
  const [skillPromptBaseline, setSkillPromptBaseline] = useState("");
  const [deptLocked, setDeptLocked] = useState(!!skillIdFromUrl);
  const appliedUrlSkillRef = useRef<string | null>(null);

  const { register, handleSubmit, watch, setValue } = useForm<CreateAgentInput>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      departmentId: preDept ?? "",
      systemPrompt: "",
      name: "",
      role: "",
      description: "",
    },
  });

  const deptId = watch("departmentId");
  const deptSlug = useMemo(() => {
    return departments?.find((d) => d.id === deptId)?.slug ?? "";
  }, [departments, deptId]);

  const suggestions = ROLE_SUGGESTIONS[deptSlug] ?? [];

  useEffect(() => {
    setSelectedSkillId(skillIdFromUrl);
    if (!skillIdFromUrl) {
      setDeptLocked(false);
      appliedUrlSkillRef.current = null;
    } else {
      setDeptLocked(true);
    }
  }, [skillIdFromUrl]);

  useEffect(() => {
    if (!skillIdFromUrl) {
      appliedUrlSkillRef.current = null;
      return;
    }
    if (!urlSkill || !departments?.length) return;
    if (appliedUrlSkillRef.current === urlSkill.id) return;
    appliedUrlSkillRef.current = urlSkill.id;
    applySkillToForm(urlSkill, departments, setValue);
    setSelectedSkillId(urlSkill.id);
    setSelectedSkillTitle(urlSkill.title);
    setSkillPromptBaseline(urlSkill.systemPrompt);
    setDeptLocked(true);
  }, [skillIdFromUrl, urlSkill, departments, setValue]);

  const deptRegister = register("departmentId");

  const onPickLibrarySkill = useCallback(
    (skill: SkillListItem) => {
      applySkillToForm(skill, departments, setValue);
      setSelectedSkillId(skill.id);
      setSelectedSkillTitle(skill.title);
      setSkillPromptBaseline(skill.systemPrompt);
      setDeptLocked(true);
    },
    [departments, setValue]
  );

  const onDrop = useCallback((accepted: File[]) => {
    setPendingFiles((f) => [...f, ...accepted]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
        ".docx",
      ],
      "text/plain": [".txt"],
    },
  });

  async function streamPrompt() {
    const name = watch("name");
    const role = watch("role");
    const description = watch("description");
    const deptName = departments?.find((d) => d.id === deptId)?.name ?? "";
    if (!name || !role || !description || !deptName || !session?.accessToken) return;
    setGenLoading(true);
    setValue("systemPrompt", "");
    try {
      const res = await fetch(`${apiBase}/api/agents/generate-prompt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          name,
          role,
          department: deptName,
          description,
        }),
      });
      if (!res.ok || !res.body) throw new Error("Generation failed");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = dec.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (line.startsWith("data: ")) {
            try {
              const j = JSON.parse(line.slice(6)) as { token?: string };
              if (j.token) acc += j.token;
            } catch {
              /* ignore */
            }
          }
        }
        setValue("systemPrompt", acc);
      }
      setSelectedSkillId(null);
      setSelectedSkillTitle(null);
      setSkillPromptBaseline("");
    } finally {
      setGenLoading(false);
    }
  }

  const steps = ["Basics", "System prompt", "Knowledge", "Chain"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create agent</CardTitle>
        <div className="flex flex-wrap gap-2 pt-2">
          {steps.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => setStep(i)}
              className={`rounded-full px-3 py-1 text-xs ${
                step === i ? "bg-accent text-white" : "bg-white/10 text-white/60"
              }`}
            >
              {i + 1}. {s}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <SkillLibraryModal
          open={libraryOpen}
          onOpenChange={setLibraryOpen}
          categories={skillCategories ?? []}
          skills={allSkills ?? []}
          onPickSkill={onPickLibrarySkill}
        />
        {deptError ? (
          <div className="rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error">
            <p>Could not load departments. Is the API running?</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => void refetchDepartments()}
            >
              Retry
            </Button>
          </div>
        ) : null}
        {catError || skillsError ? (
          <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
            <p>Skill library failed to load. You can still create an agent manually.</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                void refetchCategories();
                void refetchSkills();
              }}
            >
              Retry
            </Button>
          </div>
        ) : null}
        <form
          className="space-y-6"
          onSubmit={handleSubmit(async (data) => {
            const created = await api.post("/api/agents", {
              ...data,
              nextAgentId,
              ...(selectedSkillId ? { skillId: selectedSkillId } : {}),
            });
            const id = (created.data as { id: string }).id;
            for (const f of pendingFiles) {
              const fd = new FormData();
              fd.append("file", f);
              fd.append("title", f.name);
              await api.post(`/api/agents/${id}/knowledge`, fd, {
                headers: { "Content-Type": "multipart/form-data" },
              });
            }
            if (kbText.trim() && kbTitle.trim()) {
              await api.post(`/api/agents/${id}/knowledge`, {
                title: kbTitle,
                content: kbText,
              });
            }
            if (kbUrl.trim()) {
              await api.post(`/api/agents/${id}/knowledge`, {
                url: kbUrl,
                title: kbUrl,
              });
            }
            router.push(`/agents/${id}`);
          })}
        >
          <div className={cn(step !== 0 && "hidden", "space-y-4")}>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" onClick={() => setLibraryOpen(true)}>
                Choose from Skill Library
              </Button>
              {selectedSkillId && selectedSkillTitle ? (
                <Badge className="border border-accent/40 bg-transparent text-accent">
                  Selected skill: {selectedSkillTitle}
                </Badge>
              ) : null}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Label className="flex-1">Department</Label>
                {deptLocked ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setDeptLocked(false)}
                  >
                    Override department
                  </Button>
                ) : null}
              </div>
              <select
                className="mt-1 flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                {...deptRegister}
                disabled={deptLocked || deptLoading}
                onChange={(e) => {
                  deptRegister.onChange(e);
                  setSelectedSkillId(null);
                  setSelectedSkillTitle(null);
                  setSkillPromptBaseline("");
                  setDeptLocked(false);
                }}
              >
                <option value="">{deptLoading ? "Loading…" : "Select…"}</option>
                {departments?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Name</Label>
              <Input className="mt-1" {...register("name")} />
            </div>
            <div>
              <Label>Role / specialization</Label>
              <Input className="mt-1" list="role-suggestions" {...register("role")} />
              <datalist id="role-suggestions">
                {suggestions.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea className="mt-1" {...register("description")} />
            </div>
            <Button type="button" onClick={() => setStep(1)}>
              Next
            </Button>
          </div>

          <div className={cn(step !== 1 && "hidden", "space-y-4")}>
            {selectedSkillTitle && skillPromptBaseline ? (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
                ✓ System prompt loaded from <strong>{selectedSkillTitle}</strong>. You can edit
                it freely.
              </div>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label>System prompt</Label>
              <div className="flex flex-wrap gap-2">
                {skillPromptBaseline ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setValue("systemPrompt", skillPromptBaseline)}
                  >
                    Reset to default
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={genLoading}
                  onClick={() => void streamPrompt()}
                >
                  {genLoading ? "Generating…" : "Generate system prompt"}
                </Button>
              </div>
            </div>
            <Textarea
              className="min-h-[240px] font-mono text-xs"
              {...register("systemPrompt")}
            />
            <p className="text-xs text-white/40">
              {watch("systemPrompt")?.length ?? 0} characters
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button type="button" onClick={() => setStep(2)}>
                Next
              </Button>
            </div>
          </div>

          <div className={cn(step !== 2 && "hidden", "space-y-4")}>
            <Tabs defaultValue="files">
              <TabsList>
                <TabsTrigger value="files">Files</TabsTrigger>
                <TabsTrigger value="text">Paste text</TabsTrigger>
                <TabsTrigger value="url">URL</TabsTrigger>
              </TabsList>
              <TabsContent value="files" className="space-y-2">
                <div
                  {...getRootProps()}
                  className={`cursor-pointer rounded-lg border border-dashed border-border p-8 text-center text-sm ${
                    isDragActive ? "border-accent bg-accent/10" : ""
                  }`}
                >
                  <input {...getInputProps()} />
                  Drop PDF / DOCX here, or click to select
                </div>
                <ul className="text-xs text-white/60">
                  {pendingFiles.map((f) => (
                    <li key={f.name}>{f.name}</li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="text" className="space-y-2">
                <Input
                  placeholder="Title"
                  value={kbTitle}
                  onChange={(e) => setKbTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Content"
                  value={kbText}
                  onChange={(e) => setKbText(e.target.value)}
                />
              </TabsContent>
              <TabsContent value="url" className="space-y-2">
                <Input
                  placeholder="https://…"
                  value={kbUrl}
                  onChange={(e) => setKbUrl(e.target.value)}
                />
              </TabsContent>
            </Tabs>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button type="button" onClick={() => setStep(3)}>
                Next
              </Button>
            </div>
          </div>

          <div className={cn(step !== 3 && "hidden", "space-y-4")}>
            <AgentChainBuilder
              agents={allAgents?.map((a) => ({ id: a.id, name: a.name })) ?? []}
              value={nextAgentId}
              onChange={setNextAgentId}
            />
            <div className="rounded-lg border border-border bg-background p-3 font-mono text-xs text-white/70">
              <p>
                <strong>{watch("name")}</strong> · {watch("role")}
              </p>
              <p className="mt-1 line-clamp-3">{watch("description")}</p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button type="submit">Create agent</Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
