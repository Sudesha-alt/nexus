import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

router.get("/summary", async (_req, res) => {
  try {
    const [
      totalAgents,
      departments,
      tasksTotal,
      tasksCompleted,
      activeTasks,
    ] = await Promise.all([
      prisma.agent.count({ where: { isActive: true } }),
      prisma.department.count(),
      prisma.task.count(),
      prisma.task.count({ where: { status: "completed" } }),
      prisma.task.count({ where: { status: "running" } }),
    ]);
    res.json({
      totalAgents,
      departments,
      tasksTotal,
      tasksCompleted,
      activeTasks,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load stats" });
  }
});

export default router;
