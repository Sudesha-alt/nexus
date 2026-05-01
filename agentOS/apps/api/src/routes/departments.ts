import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

router.get("/", async (_req, res) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { agents: { where: { isActive: true } } } },
      },
    });
    res.json(departments);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list departments" });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const dept = await prisma.department.findUnique({
      where: { slug: req.params.slug },
      include: {
        agents: {
          where: { isActive: true },
          orderBy: { name: "asc" },
          include: {
            nextAgent: { select: { id: true, name: true } },
            _count: { select: { knowledgeDocs: true } },
          },
        },
      },
    });
    if (!dept) {
      res.status(404).json({ error: "Department not found" });
      return;
    }
    res.json(dept);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load department" });
  }
});

export default router;
