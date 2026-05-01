import { Router } from "express";
import { clearKnowledgeDomain, listKnowledgeByDomain } from "../db/queries";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ byDomain: listKnowledgeByDomain() });
});

router.delete("/:domain", (req, res) => {
  const domain = decodeURIComponent(req.params.domain);
  if (!domain) {
    res.status(400).json({ error: "domain required" });
    return;
  }
  clearKnowledgeDomain(domain);
  res.json({ ok: true });
});

export default router;
