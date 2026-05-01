"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AgentCard({
  agent,
}: {
  agent: {
    id: string;
    name: string;
    role: string;
    description: string;
    nextAgent: { id: string; name: string } | null;
    _count: { knowledgeDocs: number };
  };
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{agent.name}</CardTitle>
          {agent.nextAgent ? (
            <Badge variant="muted" className="shrink-0 gap-1">
              <ArrowRight className="h-3 w-3" />
              {agent.nextAgent.name}
            </Badge>
          ) : null}
        </div>
        <p className="text-xs text-accent">{agent.role}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="line-clamp-2 text-xs">{agent.description}</p>
        <Badge variant="default">{agent._count.knowledgeDocs} docs</Badge>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href={`/agents/${agent.id}`}>Edit</Link>
          </Button>
          <Button type="button" size="sm" asChild>
            <Link href={`/tasks/new?agent=${agent.id}`}>Run</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
