import { Router } from "express";
import { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

router.get("/categories", async (_req, res) => {
  try {
    const categories = await prisma.skillCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { skills: { where: { isActive: true } } } },
        department: { select: { id: true, name: true, slug: true } },
      },
    });
    res.json(categories);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list skill categories" });
  }
});

router.get("/", async (req, res) => {
  try {
    const categoryId = req.query.categoryId as string | undefined;
    const categorySlug = req.query.categorySlug as string | undefined;
    const search = ((req.query.search as string) ?? "").trim().toLowerCase();

    const where: Prisma.SkillWhereInput = { isActive: true };

    if (categoryId) {
      where.categoryId = categoryId;
    } else if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    const skills = await prisma.skill.findMany({
      where,
      orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            color: true,
            department: { select: { id: true, slug: true, name: true } },
          },
        },
      },
    });

    const filtered =
      search.length === 0
        ? skills
        : skills.filter((s) => {
            const hay = `${s.title} ${s.subtitle} ${s.description} ${s.tags.join(" ")}`.toLowerCase();
            return hay.includes(search);
          });

    res.json(filtered);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list skills" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const skill = await prisma.skill.findFirst({
      where: { id: req.params.id, isActive: true },
      include: {
        category: {
          include: {
            department: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });
    if (!skill) {
      res.status(404).json({ error: "Skill not found" });
      return;
    }
    res.json(skill);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load skill" });
  }
});

export default router;
