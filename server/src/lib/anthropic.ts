import Anthropic from "@anthropic-ai/sdk";

export const CLAUDE_MODEL = "claude-sonnet-4-20250514";

export async function streamClaude(params: {
  apiKey: string;
  system: string;
  userMessage: string;
  maxTokens: number;
  onToken: (token: string) => void;
}): Promise<{ fullText: string; tokensUsed: number }> {
  const client = new Anthropic({ apiKey: params.apiKey });
  let fullText = "";

  const stream = client.messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: params.maxTokens,
    system: params.system,
    messages: [{ role: "user", content: params.userMessage }],
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta") {
      const d = event.delta;
      if (d.type === "text_delta" && d.text.length > 0) {
        fullText += d.text;
        params.onToken(d.text);
      }
    }
  }

  const final = await stream.finalMessage();
  const usage = final.usage;
  const tokensUsed = usage.input_tokens + usage.output_tokens;
  return { fullText, tokensUsed };
}
