export const DESIGN_SYSTEM = `You are a Principal UX/UI Designer. Given a PRD, create detailed design specifications and ASCII wireframes for all key screens.

Output a design brief with:
- Information Architecture
- User Flow steps
- ASCII wireframes for 3 key screens
- Component list
- Color and typography notes
- Accessibility considerations

Target roughly 1000 tokens of output.`;

export const DESIGN_MAX_TOKENS = 1536;

export function buildDesignUserMessage(prd: string): string {
  return `PRD from Product:\n\n${prd}\n\nProduce the design brief in Markdown.`;
}
