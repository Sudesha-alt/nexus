import type { PrismaClient } from "@prisma/client";
import type { Server } from "socket.io";
import { runAgentStream, type AgentWithDept } from "./agentRunner";

async function loadChain(
  prisma: PrismaClient,
  firstAgentId: string
): Promise<AgentWithDept[]> {
  const chain: AgentWithDept[] = [];
  let id: string | null = firstAgentId;
  const seen = new Set<string>();

  while (id && !seen.has(id)) {
    seen.add(id);
    const row: AgentWithDept | null =
      (await prisma.agent.findUnique({
        where: { id },
        include: { department: true },
      })) as AgentWithDept | null;
    if (!row || !row.isActive) break;
    chain.push(row);
    id = row.nextAgentId;
  }

  return chain;
}

export async function runTaskPipeline(
  prisma: PrismaClient,
  io: Server,
  taskId: string
): Promise<void> {
  const room = `task:${taskId}`;

  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });
  if (!task) {
    io.to(room).emit("task:error", { taskId, error: "Task not found" });
    return;
  }

  if (task.status === "completed") return;

  await prisma.task.update({
    where: { id: taskId },
    data: { status: "running" },
  });

  try {
    const chain = await loadChain(prisma, task.firstAgentId);
    if (chain.length === 0) {
      throw new Error("No active agents in chain");
    }

    let currentInput = task.description;
    let lastOutput = "";

    for (let i = 0; i < chain.length; i++) {
      const agent = chain[i]!;
      const step = await prisma.taskStep.create({
        data: {
          taskId,
          agentId: agent.id,
          stepNumber: i + 1,
          input: currentInput,
          status: "running",
          startedAt: new Date(),
        },
      });

      const { text, tokensUsed } = await runAgentStream({
        prisma,
        agent,
        userInput: currentInput,
        onToken: (token) => {
          io.to(room).emit("task:token", {
            taskId,
            stepId: step.id,
            token,
          });
        },
      });

      lastOutput = text;
      await prisma.taskStep.update({
        where: { id: step.id },
        data: {
          status: "completed",
          output: text,
          completedAt: new Date(),
          tokensUsed,
        },
      });

      io.to(room).emit("task:step_complete", {
        taskId,
        stepId: step.id,
        stepNumber: step.stepNumber,
        output: text,
      });

      currentInput = text;
    }

    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: "completed",
        completedAt: new Date(),
        finalOutput: lastOutput,
      },
    });

    io.to(room).emit("task:complete", {
      taskId,
      finalOutput: lastOutput,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await prisma.task.update({
      where: { id: taskId },
      data: { status: "failed" },
    });
    await prisma.taskStep.updateMany({
      where: { taskId, status: "running" },
      data: { status: "failed", completedAt: new Date() },
    });
    io.to(room).emit("task:error", { taskId, error: message });
  }
}
