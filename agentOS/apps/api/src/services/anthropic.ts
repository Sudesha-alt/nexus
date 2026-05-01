import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL, getConfig } from "../config";

let client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: getConfig().ANTHROPIC_API_KEY });
  }
  return client;
}

export { CLAUDE_MODEL };
