import path from "node:path";
import { existsSync } from "node:fs";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

/**
 * When this file exists, Prisma skips its built-in `.env` loader.
 * Load `apps/api/.env` explicitly whether the CLI cwd is `apps/api` or the monorepo root.
 */
function loadEnvFiles(): void {
  const cwd = process.cwd();
  const candidates = [
    path.resolve(cwd, "apps", "api", ".env"),
    path.resolve(cwd, ".env"),
    path.resolve(cwd, "..", ".env"),
  ];
  for (const file of candidates) {
    if (existsSync(file)) {
      loadEnv({ path: file });
      return;
    }
  }
}

loadEnvFiles();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  seed: "tsx prisma/seed.ts",
});
