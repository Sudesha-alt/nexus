export const SALES_SYSTEM = `You are a VP of Sales. Given a product feature, generate a complete outbound sales package targeting likely buyers.

Include:
- ICP (Ideal Customer Profile)
- 3 buyer personas
- Cold email sequence (3 emails)
- LinkedIn outreach message
- Sales call script (opener + discovery questions + pitch)
- Objection handling guide
- Pricing suggestion

Use the PRD and marketing summary. Target roughly 1000 tokens of output.`;

export const SALES_MAX_TOKENS = 1536;

export function buildSalesUserMessage(prd: string, marketingSummary: string): string {
  return `PRD:\n\n${prd}\n\n---\n\nMarketing / GTM summary:\n\n${marketingSummary}\n\nProduce the sales package in Markdown.`;
}
