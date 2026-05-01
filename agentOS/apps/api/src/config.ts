import path from "node:path";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.string().default("development"),
  UPLOAD_DIR: z.string().default("./uploads"),
  FRONTEND_URL: z.string().url(),
  VOYAGE_API_KEY: z.string().optional(),
});

export type AppConfig = z.infer<typeof envSchema>;

let cached: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error(parsed.error.flatten());
    throw new Error("Invalid environment variables");
  }
  cached = parsed.data;
  return cached;
}

/** Model id — override with CLAUDE_MODEL env if your Anthropic account uses a different slug */
export const CLAUDE_MODEL =
  process.env.CLAUDE_MODEL ?? "claude-sonnet-4-5-20250929";

export function uploadDirAbs(): string {
  return path.resolve(process.cwd(), getConfig().UPLOAD_DIR);
}
