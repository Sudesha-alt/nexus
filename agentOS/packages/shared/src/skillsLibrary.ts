import { customerSuccessSkills } from "./skills/customerSuccess";
import { engineeringSkills } from "./skills/engineering";
import { financeSkills } from "./skills/finance";
import { hrSkills } from "./skills/hr";
import { legalSkills } from "./skills/legal";
import { marketingSkills } from "./skills/marketing";
import { SKILL_CATEGORIES_META } from "./skills/meta";
import { productSkills } from "./skills/product";
import { salesSkills } from "./skills/sales";
import type {
  SkillCategoryMeta,
  SkillDifficulty,
  SkillTemplate,
} from "./skills/types";

export type { SkillCategoryMeta, SkillDifficulty, SkillTemplate };
export { SKILL_CATEGORIES_META };

/** Full pre-built library — every specialization with production-ready system prompts. */
export const SKILLS_LIBRARY: SkillTemplate[] = [
  ...engineeringSkills,
  ...productSkills,
  ...salesSkills,
  ...marketingSkills,
  ...hrSkills,
  ...financeSkills,
  ...legalSkills,
  ...customerSuccessSkills,
];
