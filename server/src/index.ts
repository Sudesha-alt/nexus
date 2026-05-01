import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "node:http";
import path from "node:path";
import workflowsRouter from "./routes/workflows";
import historyRouter from "./routes/history";
import knowledgeRouter from "./routes/knowledge";
import settingsRouter from "./routes/settings";
import integrationsRouter from "./routes/integrations";
import { initSocket } from "./lib/socket";
import { getDb, initDefaultSettings } from "./db/queries";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const httpServer = createServer(app);

initSocket(httpServer);
getDb();
initDefaultSettings();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));

app.use("/api/workflows", workflowsRouter);
app.use("/api/history", historyRouter);
app.use("/api/knowledge", knowledgeRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/integrations", integrationsRouter);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

const PORT = Number(process.env.PORT) || 3001;

httpServer.listen(PORT, () => {
  console.log(`NEXUS server listening on ${PORT}`);
});
