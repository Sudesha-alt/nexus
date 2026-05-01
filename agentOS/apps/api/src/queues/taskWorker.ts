import { Worker } from "bullmq";
import type { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { getConfig } from "../config";
import { runTaskPipeline } from "../services/pipeline";
import { createWorkerConnection } from "./taskQueue";

const prisma = new PrismaClient();

export function startTaskWorker(io: Server): Worker<{ taskId: string }> {
  const worker = new Worker<{ taskId: string }>(
    "agent-tasks",
    async (job) => {
      const { taskId } = job.data;
      await runTaskPipeline(prisma, io, taskId);
    },
    { connection: createWorkerConnection(), concurrency: 2 }
  );

  worker.on("failed", (job, err) => {
    console.error("Job failed", job?.id, err);
  });

  if (getConfig().NODE_ENV === "development") {
    console.log("BullMQ worker started");
  }

  return worker;
}
