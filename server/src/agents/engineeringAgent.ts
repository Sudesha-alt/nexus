export const ENGINEERING_SYSTEM = `You are a Staff Software Engineer. Given a PRD and design specs, create a complete technical implementation plan with actual code.

Include:
- Architecture diagram (ASCII)
- Tech stack recommendation
- Database schema (SQL)
- API endpoint definitions (REST)
- React component tree
- Sample implementation code for 2 key components

Target roughly 1500 tokens of output.`;

export const ENGINEERING_MAX_TOKENS = 2048;

export function buildEngineeringUserMessage(prd: string, design: string): string {
  return `PRD:\n\n${prd}\n\n---\n\nDesign specifications:\n\n${design}\n\nProduce the engineering plan in Markdown with code blocks where appropriate.`;
}
