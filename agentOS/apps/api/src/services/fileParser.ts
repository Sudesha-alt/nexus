import fs from "node:fs/promises";
import * as cheerio from "cheerio";
import mammoth from "mammoth";
import pdfParse from "pdf-parse";

export async function parsePdfBuffer(buf: Buffer): Promise<string> {
  const res = await pdfParse(buf);
  return res.text ?? "";
}

export async function parseDocxBuffer(buf: Buffer): Promise<string> {
  const res = await mammoth.extractRawText({ buffer: buf });
  return res.value;
}

export async function parseUrlContent(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "AgentOS-KnowledgeBot/1.0",
    },
  });
  if (!res.ok) throw new Error(`URL fetch failed: ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  $("script, style, nav, footer").remove();
  const text = $("body").text().replace(/\s+/g, " ").trim();
  return text.slice(0, 500_000);
}

export async function parseFileByMime(
  buf: Buffer,
  mime: string
): Promise<string> {
  if (mime === "application/pdf") return parsePdfBuffer(buf);
  if (
    mime ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return parseDocxBuffer(buf);
  }
  if (mime.startsWith("text/")) return buf.toString("utf-8");
  throw new Error(`Unsupported file type: ${mime}`);
}

export async function readUploadFile(filePath: string): Promise<Buffer> {
  return fs.readFile(filePath);
}
