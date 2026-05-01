import type { Agent, Department } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";
import { getAnthropic, CLAUDE_MODEL } from "./anthropic";
import { searchKnowledge } from "./embeddings";

export type AgentWithDept = Agent & { department: Department };

function buildSystemPrompt(agent: AgentWithDept, kbBlock: string): string {
  return `${agent.systemPrompt}

You are ${agent.name}, a ${agent.role} in the ${agent.department.name} department.
Your task is to process the input given to you and produce a clear, structured output.
If relevant knowledge base context is provided, use it to inform your response.
Always end your response with a clear "## Output" section summarizing the key deliverable.

KNOWLEDGE BASE CONTEXT (if any relevant docs found via semantic search):
${kbBlock || "(none)"}`;
}

export async function runAgentStream(params: {
  prisma: PrismaClient;
  agent: AgentWithDept;
  userInput: string;
  onToken: (t: string) => void;
}): Promise<{ text: string; tokensUsed: number }> {
  const { prisma, agent, userInput, onToken } = params;
  const docs = await searchKnowledge(prisma, agent.id, userInput, 3, 0.7);
  const kbBlock = docs.length
    ? docs.map((d) => `### ${d.title}\n${d.content}`).join("\n\n---\n\n")
    : "";

  const system = buildSystemPrompt(agent, kbBlock);
  const stream = await getAnthropic().messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: 8192,
    system,
    messages: [{ role: "user", content: userInput }],
  });

  let full = "";
  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      const t = event.delta.text;
      full += t;
      onToken(t);
    }
  }

  const final = await stream.finalMessage();
  const tokensUsed = final.usage?.output_tokens ?? 0;
  return { text: full, tokensUsed };
}
