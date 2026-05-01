import { Queue } from "bullmq";
import IORedis from "ioredis";
import { getConfig } from "../config";

const connection = new IORedis(getConfig().REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const taskQueue = new Queue<{ taskId: string }>("agent-tasks", {
  connection,
});

export async function enqueueTask(taskId: string): Promise<void> {
  await taskQueue.add(
    "run",
    { taskId },
    {
      jobId: taskId,
      removeOnComplete: true,
      removeOnFail: false,
    }
  );
}

export function getQueueConnection(): IORedis {
  return connection;
}

export function createWorkerConnection(): IORedis {
  return connection.duplicate();
}
