"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function OutputPanel({
  streaming,
  steps,
  finalOutput,
  taskComplete,
}: {
  streaming: string;
  steps: { id: string; stepNumber: number; output: string | null }[];
  finalOutput: string | null;
  taskComplete: boolean;
}) {
  const [tab, setTab] = useState("stream");

  const copyText =
    finalOutput ??
    steps.find((s) => s.id === tab)?.output ??
    (tab === "stream" ? streaming : "") ??
    "";

  return (
    <div className="flex h-full min-h-[320px] flex-col rounded-xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-sans text-sm font-semibold">Output</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void navigator.clipboard.writeText(copyText)}
        >
          Copy
        </Button>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="stream">Live</TabsTrigger>
          {steps.map((s) => (
            <TabsTrigger key={s.id} value={s.id}>
              Step {s.stepNumber}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="stream" className="mt-4 max-h-[60vh] overflow-auto">
          <div className="max-w-none font-mono text-sm leading-relaxed text-white/90 [&_a]:text-accent">
            <ReactMarkdown>{streaming || "_Waiting for tokens…_"}</ReactMarkdown>
          </div>
        </TabsContent>
        {steps.map((s) => (
          <TabsContent key={s.id} value={s.id} className="mt-4 max-h-[60vh] overflow-auto">
            <div className="max-w-none font-mono text-sm leading-relaxed text-white/90 [&_a]:text-accent">
              <ReactMarkdown>{s.output ?? "_No output_"}</ReactMarkdown>
            </div>
          </TabsContent>
        ))}
      </Tabs>
      {taskComplete && finalOutput ? (
        <div className="mt-4 rounded-lg border border-success/30 bg-success/10 p-3">
          <p className="text-xs font-semibold text-success">Final output</p>
          <div className="mt-2 max-w-none font-mono text-sm leading-relaxed text-white/90 [&_a]:text-accent">
            <ReactMarkdown>{finalOutput}</ReactMarkdown>
          </div>
        </div>
      ) : null}
    </div>
  );
}
