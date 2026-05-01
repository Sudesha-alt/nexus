import "dotenv/config";
import fs from "node:fs";
import http from "node:http";
import cors from "cors";
import express from "express";
import { Server } from "socket.io";
import { getConfig, uploadDirAbs } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import { startTaskWorker } from "./queues/taskWorker";
import agentsRouter from "./routes/agents";
import authRouter from "./routes/auth";
import departmentsRouter from "./routes/departments";
import knowledgeRouter from "./routes/knowledge";
import statsRouter from "./routes/stats";
import skillsRouter from "./routes/skills";
import tasksRouter from "./routes/tasks";

const cfg = getConfig();
fs.mkdirSync(uploadDirAbs(), { recursive: true });

const app = express();
app.use(cors({ origin: cfg.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: "12mb" }));

app.use("/api/auth", authRouter);
app.use("/api/departments", departmentsRouter);
app.use("/api/agents", agentsRouter);
app.use("/api/knowledge", knowledgeRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/stats", statsRouter);
app.use("/api/skills", skillsRouter);

app.use(errorHandler);

const server = http.createServer(app);
export const io = new Server(server, {
  cors: { origin: cfg.FRONTEND_URL, credentials: true },
});

io.on("connection", (socket) => {
  socket.on("task:join", (taskId: string) => {
    if (typeof taskId === "string" && taskId.length > 0) {
      void socket.join(`task:${taskId}`);
    }
  });
  socket.on("task:leave", (taskId: string) => {
    if (typeof taskId === "string") {
      void socket.leave(`task:${taskId}`);
    }
  });
});

startTaskWorker(io);

server.listen(cfg.PORT, () => {
  console.log(`AgentOS API http://localhost:${cfg.PORT}`);
});
