import { Router } from "express";
import { listWorkflows } from "../db/queries";

const router = Router();

router.get("/", (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q : undefined;
  const status =
    typeof req.query.status === "string" ? req.query.status : undefined;
  let rows = listWorkflows(q);
  if (status && status !== "all") {
    rows = rows.filter((r) => r.status === status);
  }
  res.json({ workflows: rows });
});

export default router;
