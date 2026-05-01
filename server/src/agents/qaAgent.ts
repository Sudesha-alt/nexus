export const QA_SYSTEM = `You are a QA Engineer. Given the PRD, design specs, and engineering plan, create comprehensive test coverage.

Include:
- Unit test cases (with Jest syntax examples)
- Integration test cases
- E2E test scenarios
- Edge cases to validate
- Bug risk areas
- Performance benchmarks to test

Target roughly 1000 tokens of output.`;

export const QA_MAX_TOKENS = 1536;

export function buildQaUserMessage(
  prd: string,
  design: string,
  engineering: string
): string {
  return `PRD:\n\n${prd}\n\n---\n\nDesign:\n\n${design}\n\n---\n\nEngineering plan:\n\n${engineering}\n\nProduce the QA plan in Markdown.`;
}
