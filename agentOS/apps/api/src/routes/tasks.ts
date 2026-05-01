import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { createTaskSchema } from "@agentos/shared";
import { authMiddleware, type AuthedRequest } from "../middleware/auth";
import { enqueueTask, taskQueue } from "../queues/taskQueue";

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

router.get("/", async (req: AuthedRequest, res) => {
  try {
    const status = req.query.status as string | undefined;
    const tasks = await prisma.task.findMany({
      where: {
        createdById: req.userId!,
        ...(status && status !== "all" ? { status } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        firstAgent: {
          select: {
            id: true,
            name: true,
            department: { select: { name: true, slug: true } },
          },
        },
        _count: { select: { steps: true } },
      },
    });
    res.json(tasks);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list tasks" });
  }
});

router.post("/", async (req: AuthedRequest, res) => {
  try {
    const parsed = createTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid body" });
      return;
    }
    const agent = await prisma.agent.findFirst({
      where: { id: parsed.data.firstAgentId, isActive: true },
    });
    if (!agent) {
      res.status(400).json({ error: "Starting agent not found" });
      return;
    }
    const task = await prisma.task.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        firstAgentId: parsed.data.firstAgentId,
        createdById: req.userId!,
        status: "pending",
      },
    });
    await enqueueTask(task.id);
    res.status(201).json(task);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create task" });
  }
});

router.get("/:id", async (req: AuthedRequest, res) => {
  try {
    const task = await prisma.task.findFirst({
      where: { id: req.params.id, createdById: req.userId! },
      include: {
        steps: {
          orderBy: { stepNumber: "asc" },
          include: {
            agent: {
              select: {
                id: true,
                name: true,
                role: true,
                department: { select: { name: true, icon: true } },
              },
            },
          },
        },
        firstAgent: {
          select: { id: true, name: true, department: true },
        },
      },
    });
    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    res.json(task);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load task" });
  }
});

router.delete("/:id", async (req: AuthedRequest, res) => {
  try {
    const task = await prisma.task.findFirst({
      where: { id: req.params.id, createdById: req.userId! },
    });
    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    const job = await taskQueue.getJob(task.id);
    await job?.remove();
    if (task.status === "running" || task.status === "pending") {
      await prisma.task.update({
        where: { id: task.id },
        data: { status: "failed" },
      });
    }
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to cancel task" });
  }
});

export default router;
