import { Router } from "express";
import multer from "multer";
import { PrismaClient } from "@prisma/client";
import {
  createAgentSchema,
  generatePromptSchema,
  knowledgeTextSchema,
  knowledgeUrlSchema,
  setChainSchema,
  updateAgentSchema,
} from "@agentos/shared";
import { authMiddleware, type AuthedRequest } from "../middleware/auth";
import { getAnthropic, CLAUDE_MODEL } from "../services/anthropic";
import { parseFileByMime, parseUrlContent } from "../services/fileParser";
import { storeKnowledgeChunks } from "../services/embeddings";

const router = Router();
const prisma = new PrismaClient();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

router.use(authMiddleware);

router.post("/generate-prompt", async (req, res) => {
  try {
    const parsed = generatePromptSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid body" });
      return;
    }
    const { name, role, department, description } = parsed.data;
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.flushHeaders?.();

    const stream = await getAnthropic().messages.stream({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      system:
        "You write expert system prompts for AI agents. Output only the system prompt text, no preamble.",
      messages: [
        {
          role: "user",
          content: `Create a detailed system prompt for an AI agent named "${name}" with role "${role}" in the ${department} department. Context: ${description}`,
        },
      ],
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        const t = event.delta.text;
        res.write(`data: ${JSON.stringify({ token: t })}\n\n`);
      }
    }
    res.end();
  } catch (e) {
    console.error(e);
    if (!res.headersSent) {
      res.status(500).json({ error: "Prompt generation failed" });
    } else {
      res.end();
    }
  }
});

router.get("/", async (req, res) => {
  try {
    const departmentId = req.query.departmentId as string | undefined;
    const agents = await prisma.agent.findMany({
      where: {
        isActive: true,
        ...(departmentId ? { departmentId } : {}),
      },
      orderBy: { name: "asc" },
      include: {
        department: true,
        skill: { select: { id: true, title: true, slug: true } },
        nextAgent: { select: { id: true, name: true } },
      },
    });
    res.json(agents);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list agents" });
  }
});

router.post("/", async (req: AuthedRequest, res) => {
  try {
    const parsed = createAgentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
      return;
    }
    const body = parsed.data;
    let skillId: string | null = body.skillId ?? null;

    if (skillId) {
      const skill = await prisma.skill.findUnique({
        where: { id: skillId },
        include: { category: true },
      });
      if (!skill) {
        res.status(400).json({ error: "Skill not found" });
        return;
      }
      if (skill.category.departmentId && skill.category.departmentId !== body.departmentId) {
        res.status(400).json({
          error: "Department must match the selected skill's department (clear skill or change department).",
        });
        return;
      }
    }

    const agent = await prisma.$transaction(async (tx) => {
      const a = await tx.agent.create({
        data: {
          name: body.name,
          role: body.role,
          description: body.description,
          systemPrompt: body.systemPrompt,
          departmentId: body.departmentId,
          skillId,
          createdById: req.userId!,
          nextAgentId: body.nextAgentId ?? null,
        },
        include: { department: true, nextAgent: true, skill: true },
      });
      if (skillId) {
        await tx.skill.update({
          where: { id: skillId },
          data: { usageCount: { increment: 1 } },
        });
      }
      return a;
    });

    res.status(201).json(agent);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create agent" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const agent = await prisma.agent.findFirst({
      where: { id: req.params.id },
      include: {
        department: true,
        skill: {
          select: {
            id: true,
            slug: true,
            title: true,
            subtitle: true,
            category: { select: { name: true, slug: true, color: true } },
          },
        },
        nextAgent: { include: { department: true } },
        prevAgents: { select: { id: true, name: true } },
        knowledgeDocs: {
          select: {
            id: true,
            title: true,
            sourceType: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!agent) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }
    const runs = await prisma.taskStep.findMany({
      where: { agentId: agent.id },
      orderBy: { startedAt: "desc" },
      take: 50,
      include: {
        task: { select: { id: true, title: true, status: true, createdAt: true } },
      },
    });
    const tokenAgg = await prisma.taskStep.aggregate({
      where: { agentId: agent.id, tokensUsed: { not: null } },
      _avg: { tokensUsed: true },
      _count: true,
    });
    res.json({
      ...agent,
      runHistory: runs,
      stats: {
        stepsRun: tokenAgg._count,
        avgTokens: tokenAgg._avg.tokensUsed,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load agent" });
  }
});

router.put("/:id", async (req: AuthedRequest, res) => {
  try {
    const parsed = updateAgentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid body" });
      return;
    }
    const existing = await prisma.agent.findFirst({
      where: { id: req.params.id, createdById: req.userId! },
    });
    if (!existing) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }
    const agent = await prisma.agent.update({
      where: { id: req.params.id },
      data: parsed.data,
      include: { department: true, nextAgent: true },
    });
    res.json(agent);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update agent" });
  }
});

router.delete("/:id", async (req: AuthedRequest, res) => {
  try {
    const existing = await prisma.agent.findFirst({
      where: { id: req.params.id, createdById: req.userId! },
    });
    if (!existing) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }
    await prisma.agent.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete agent" });
  }
});

router.put("/:id/chain", async (req: AuthedRequest, res) => {
  try {
    const parsed = setChainSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid body" });
      return;
    }
    const existing = await prisma.agent.findFirst({
      where: { id: req.params.id, createdById: req.userId! },
    });
    if (!existing) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }
    const nextId = parsed.data.nextAgentId;
    if (nextId === req.params.id) {
      res.status(400).json({ error: "Cannot chain to self" });
      return;
    }
    if (nextId) {
      const next = await prisma.agent.findFirst({
        where: { id: nextId, isActive: true },
      });
      if (!next) {
        res.status(400).json({ error: "Next agent not found" });
        return;
      }
    }
    const agent = await prisma.agent.update({
      where: { id: req.params.id },
      data: { nextAgentId: nextId },
      include: { department: true, nextAgent: true },
    });
    res.json(agent);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update chain" });
  }
});

router.get("/:id/knowledge", async (req, res) => {
  try {
    const docs = await prisma.knowledgeDoc.findMany({
      where: { agentId: req.params.id },
      select: {
        id: true,
        title: true,
        sourceType: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(docs);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list knowledge" });
  }
});

router.post(
  "/:id/knowledge",
  upload.single("file"),
  async (req: AuthedRequest, res) => {
    try {
      const agent = await prisma.agent.findFirst({
        where: { id: req.params.id, createdById: req.userId! },
      });
      if (!agent) {
        res.status(404).json({ error: "Agent not found" });
        return;
      }

      if (req.file) {
        const mime = req.file.mimetype;
        const text = await parseFileByMime(req.file.buffer, mime);
        const title =
          (req.body.title as string) || req.file.originalname || "Uploaded file";
        await storeKnowledgeChunks(
          prisma,
          agent.id,
          title,
          "file",
          text
        );
        res.status(201).json({ ok: true });
        return;
      }

      if (req.body?.content && req.body?.title !== undefined) {
        const parsed = knowledgeTextSchema.safeParse({
          title: req.body.title,
          content: req.body.content,
        });
        if (!parsed.success) {
          res.status(400).json({ error: "Invalid text knowledge body" });
          return;
        }
        await storeKnowledgeChunks(
          prisma,
          agent.id,
          parsed.data.title,
          "text",
          parsed.data.content
        );
        res.status(201).json({ ok: true });
        return;
      }

      if (req.body?.url) {
        const parsed = knowledgeUrlSchema.safeParse({
          url: req.body.url,
          title: req.body.title,
        });
        if (!parsed.success) {
          res.status(400).json({ error: "Invalid URL knowledge body" });
          return;
        }
        const page = await parseUrlContent(parsed.data.url);
        const title = parsed.data.title ?? parsed.data.url;
        await storeKnowledgeChunks(prisma, agent.id, title, "url", page);
        res.status(201).json({ ok: true });
        return;
      }

      res.status(400).json({
        error: "Provide multipart file, or JSON {title, content}, or JSON {url}",
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to add knowledge" });
    }
  }
);

export default router;
