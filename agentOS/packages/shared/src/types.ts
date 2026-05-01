export type TaskStatus = "pending" | "running" | "completed" | "failed";
export type StepStatus = "pending" | "running" | "completed" | "failed";
export type KnowledgeSourceType = "file" | "text" | "url";

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthMeResponse {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface DepartmentListItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  _count: { agents: number };
}

export interface TaskListItem {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: string;
  completedAt: string | null;
  firstAgent: { id: string; name: string; department: { name: string; slug: string } };
  _count: { steps: number };
}

export interface SocketTaskTokenPayload {
  taskId: string;
  stepId: string;
  token: string;
}

export interface SocketTaskStepCompletePayload {
  taskId: string;
  stepId: string;
  stepNumber: number;
  output: string;
}

export interface SocketTaskCompletePayload {
  taskId: string;
  finalOutput: string;
}

export interface SocketTaskErrorPayload {
  taskId: string;
  error: string;
}
