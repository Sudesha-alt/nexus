import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createAgentSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  description: z.string().min(1),
  systemPrompt: z.string().min(1),
  departmentId: z.string().min(1),
  nextAgentId: z.string().nullable().optional(),
  skillId: z.string().min(1).optional(),
});

export const updateAgentSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  systemPrompt: z.string().min(1).optional(),
  departmentId: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  nextAgentId: z.string().nullable().optional(),
});

export const setChainSchema = z.object({
  nextAgentId: z.string().nullable(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  firstAgentId: z.string().min(1),
});

export const generatePromptSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  department: z.string().min(1),
  description: z.string().min(1),
});

export const knowledgeTextSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

export const knowledgeUrlSchema = z.object({
  title: z.string().min(1).optional(),
  url: z.string().url(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type GeneratePromptInput = z.infer<typeof generatePromptSchema>;
