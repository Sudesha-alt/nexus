export type SkillDifficulty =
  | "junior"
  | "intermediate"
  | "senior"
  | "principal";

export interface SkillTemplate {
  categorySlug: string;
  title: string;
  subtitle: string;
  description: string;
  systemPrompt: string;
  tags: string[];
  suggestedTools: string[];
  exampleInputs: string[];
  difficulty: SkillDifficulty;
  sortOrder: number;
}

export interface SkillCategoryMeta {
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  sortOrder: number;
}
