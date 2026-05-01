"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SkillListItem } from "@/hooks/useSkills";

type Props = {
  skill: SkillListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SkillDrawer({ skill, open, onOpenChange }: Props) {
  const router = useRouter();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open && closeRef.current) {
      closeRef.current.focus();
    }
  }, [open]);

  if (!skill) return null;

  const s = skill;
  const accent = s.category.color || "#6366f1";

  function copyPrompt() {
    void navigator.clipboard.writeText(s.systemPrompt);
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col border-l border-border bg-surface shadow-xl duration-200",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
          )}
          aria-describedby={undefined}
        >
          <div className="flex items-start justify-between border-b border-border p-4">
            <div>
              <DialogPrimitive.Title className="font-sans text-lg font-semibold text-white">
                {s.title}
              </DialogPrimitive.Title>
              <Badge
                className="mt-2 border font-mono text-[10px]"
                style={{ backgroundColor: `${accent}33`, color: accent, borderColor: `${accent}55` }}
              >
                {s.category.name}
              </Badge>
            </div>
            <DialogPrimitive.Close
              ref={closeRef}
              className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
            <p className="text-sm leading-relaxed text-white/70">{s.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {s.tags.map((t) => (
                <span key={t} className="rounded-full bg-white/5 px-2 py-0.5 font-mono text-[10px] text-white/60">
                  {t}
                </span>
              ))}
            </div>
            <div>
              <h4 className="mb-2 font-mono text-xs font-medium text-white/50">Example inputs</h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-white/65">
                {s.exampleInputs.map((ex, i) => (
                  <li key={i}>{ex}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-mono text-xs font-medium text-white/50">System prompt</h4>
                <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={copyPrompt}>
                  Copy
                </Button>
              </div>
              <pre className="max-h-[42vh] overflow-auto rounded-lg border border-border bg-black/40 p-3 font-mono text-[11px] leading-relaxed text-white/85">
                {s.systemPrompt.split("\n").map((line, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="w-8 shrink-0 select-none text-right text-white/25">{i + 1}</span>
                    <span className="whitespace-pre-wrap">{line || " "}</span>
                  </div>
                ))}
              </pre>
            </div>
          </div>

          <div className="border-t border-border p-4">
            <Button
              type="button"
              className="w-full"
              onClick={() => {
                onOpenChange(false);
                router.push(`/agents/new?skillId=${s.id}`);
              }}
            >
              Create Agent with this Skill
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
