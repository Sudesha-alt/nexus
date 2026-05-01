import { randomUUID } from "node:crypto";
import type { PrismaClient } from "@prisma/client";
import { getConfig } from "../config";

const TARGET_DIM = 1536;
const CHUNK_CHARS = 2000;

function padTo1536(vec: number[]): number[] {
  if (vec.length === TARGET_DIM) return vec;
  if (vec.length > TARGET_DIM) return vec.slice(0, TARGET_DIM);
  return [...vec, ...Array(TARGET_DIM - vec.length).fill(0)];
}

/**
 * Voyage AI embeddings (voyage-3-large), zero-padded to 1536 dims for pgvector schema.
 * Set VOYAGE_API_KEY in .env. Without it, uses deterministic pseudo-embeddings (dev only).
 */
export async function embedText(text: string): Promise<number[]> {
  const key = getConfig().VOYAGE_API_KEY;
  const input = text.slice(0, 32_000);
  if (key) {
    const res = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "voyage-3-large",
        input,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Voyage embeddings failed: ${res.status} ${err}`);
    }
    const json = (await res.json()) as {
      data?: { embedding: number[] }[];
    };
    const emb = json.data?.[0]?.embedding;
    if (!emb?.length) throw new Error("Voyage returned no embedding");
    return padTo1536(emb);
  }

  // Dev fallback: deterministic pseudo-vector (not semantically meaningful)
  const buf = Buffer.from(input, "utf-8");
  const vec = Array(TARGET_DIM).fill(0) as number[];
  for (let i = 0; i < buf.length; i++) {
    vec[i % TARGET_DIM] += buf[i]! / 255;
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

export function chunkText(content: string): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < content.length; i += CHUNK_CHARS) {
    chunks.push(content.slice(i, i + CHUNK_CHARS));
  }
  return chunks.length ? chunks : [""];
}

export async function storeKnowledgeChunks(
  prisma: PrismaClient,
  agentId: string,
  title: string,
  sourceType: string,
  fullContent: string
): Promise<void> {
  const chunks = chunkText(fullContent);
  let part = 0;
  for (const chunk of chunks) {
    if (!chunk.trim()) continue;
    part += 1;
    const embedding = await embedText(chunk);
    const literal = `[${embedding.join(",")}]`;
    const docTitle = chunks.filter((c) => c.trim()).length > 1 ? `${title} (part ${part})` : title;
    await prisma.$executeRawUnsafe(
      `INSERT INTO "KnowledgeDoc" ("id", "agentId", "title", "sourceType", "content", "embedding", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6::vector, NOW())`,
      randomUUID(),
      agentId,
      docTitle,
      sourceType,
      chunk,
      literal
    );
  }
}

export async function searchKnowledge(
  prisma: PrismaClient,
  agentId: string,
  query: string,
  topK = 3,
  minSimilarity = 0.7
): Promise<{ title: string; content: string }[]> {
  const qEmb = await embedText(query);
  const literal = `[${qEmb.join(",")}]`;

  const k = Math.min(Math.max(topK, 1), 20);
  const rows = await prisma.$queryRawUnsafe<
    { title: string; content: string; similarity: number }[]
  >(
    `SELECT "title", "content",
            1 - ("embedding" <=> $1::vector) AS similarity
     FROM "KnowledgeDoc"
     WHERE "agentId" = $2 AND "embedding" IS NOT NULL
     ORDER BY "embedding" <=> $1::vector
     LIMIT ${k}`,
    literal,
    agentId
  );

  return rows
    .filter(
      (r: { title: string; content: string; similarity: number }) =>
        r.similarity > minSimilarity
    )
    .map((r: { title: string; content: string }) => ({
      title: r.title,
      content: r.content,
    }));
}
