import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, type AuthedRequest } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

router.delete("/:docId", async (req: AuthedRequest, res) => {
  try {
    const doc = await prisma.knowledgeDoc.findUnique({
      where: { id: req.params.docId },
      include: { agent: true },
    });
    if (!doc) {
      res.status(404).json({ error: "Document not found" });
      return;
    }
    if (doc.agent.createdById !== req.userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    await prisma.knowledgeDoc.delete({ where: { id: doc.id } });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete document" });
  }
});

export default router;
