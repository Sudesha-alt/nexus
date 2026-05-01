import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { SKILL_CATEGORIES_META, SKILLS_LIBRARY } from "@agentos/shared";

const prisma = new PrismaClient();

function skillSlug(categorySlug: string, title: string): string {
  const t = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${categorySlug}__${t}`;
}

async function main() {
  const passwordHash = await bcrypt.hash("Demo@1234", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@agentos.ai" },
    update: {},
    create: {
      email: "demo@agentos.ai",
      passwordHash,
      name: "Alex Chen",
      role: "ceo",
    },
  });

  const departments = [
    {
      name: "Engineering",
      slug: "engineering",
      description: "Build and scale product technology.",
      icon: "Code2",
      color: "blue",
    },
    {
      name: "Product",
      slug: "product",
      description: "Define what to build and why.",
      icon: "Layers",
      color: "violet",
    },
    {
      name: "QA",
      slug: "qa",
      description: "Quality, reliability, and test strategy.",
      icon: "ShieldCheck",
      color: "amber",
    },
    {
      name: "Sales",
      slug: "sales",
      description: "Revenue, pipeline, and customer relationships.",
      icon: "TrendingUp",
      color: "emerald",
    },
    {
      name: "Marketing",
      slug: "marketing",
      description: "Brand, demand, and growth.",
      icon: "Megaphone",
      color: "pink",
    },
    {
      name: "HR",
      slug: "hr",
      description: "People operations and talent.",
      icon: "Users",
      color: "orange",
    },
    {
      name: "Finance",
      slug: "finance",
      description: "Planning, reporting, and fiscal health.",
      icon: "DollarSign",
      color: "teal",
    },
    {
      name: "Legal",
      slug: "legal",
      description: "Contracts, compliance, and commercial legal support.",
      icon: "Scale",
      color: "slate",
    },
    {
      name: "Customer Success",
      slug: "customer-success",
      description: "Onboarding, retention, expansion, and customer outcomes.",
      icon: "HeartHandshake",
      color: "cyan",
    },
  ];

  for (const d of departments) {
    await prisma.department.upsert({
      where: { slug: d.slug },
      update: d,
      create: d,
    });
  }

  for (const meta of SKILL_CATEGORIES_META) {
    const dept = await prisma.department.findUnique({
      where: { slug: meta.slug },
    });
    await prisma.skillCategory.upsert({
      where: { slug: meta.slug },
      update: {
        name: meta.name,
        description: meta.description,
        icon: meta.icon,
        color: meta.color,
        sortOrder: meta.sortOrder,
        departmentId: dept?.id ?? null,
      },
      create: {
        name: meta.name,
        slug: meta.slug,
        description: meta.description,
        icon: meta.icon,
        color: meta.color,
        sortOrder: meta.sortOrder,
        departmentId: dept?.id ?? null,
      },
    });
  }

  for (const tmpl of SKILLS_LIBRARY) {
    const category = await prisma.skillCategory.findUnique({
      where: { slug: tmpl.categorySlug },
    });
    if (!category) {
      console.warn("Missing skill category:", tmpl.categorySlug);
      continue;
    }
    const slug = skillSlug(tmpl.categorySlug, tmpl.title);
    await prisma.skill.upsert({
      where: { slug },
      update: {
        title: tmpl.title,
        subtitle: tmpl.subtitle,
        description: tmpl.description,
        systemPrompt: tmpl.systemPrompt,
        tags: tmpl.tags,
        suggestedTools: tmpl.suggestedTools,
        exampleInputs: tmpl.exampleInputs,
        difficulty: tmpl.difficulty,
        sortOrder: tmpl.sortOrder,
        isActive: true,
      },
      create: {
        slug,
        categoryId: category.id,
        title: tmpl.title,
        subtitle: tmpl.subtitle,
        description: tmpl.description,
        systemPrompt: tmpl.systemPrompt,
        tags: tmpl.tags,
        suggestedTools: tmpl.suggestedTools,
        exampleInputs: tmpl.exampleInputs,
        difficulty: tmpl.difficulty,
        sortOrder: tmpl.sortOrder,
      },
    });
  }

  const eng = await prisma.department.findUniqueOrThrow({
    where: { slug: "engineering" },
  });

  let atlas = await prisma.agent.findFirst({
    where: { name: "Atlas", departmentId: eng.id },
  });
  if (!atlas) {
    atlas = await prisma.agent.create({
      data: {
        name: "Atlas",
        role: "System Architect",
        description: "System design and scalability.",
        systemPrompt:
          "You are Atlas, a system architect. Focus on tradeoffs, scalability, and risk.",
        departmentId: eng.id,
        createdById: user.id,
        nextAgentId: null,
      },
    });
  }

  let pixel = await prisma.agent.findFirst({
    where: { name: "Pixel", departmentId: eng.id },
  });
  if (!pixel) {
    pixel = await prisma.agent.create({
      data: {
        name: "Pixel",
        role: "Frontend Engineer",
        description: "React, Next.js, and design systems.",
        systemPrompt:
          "You are Pixel, a frontend engineer. Focus on UX, components, and performance.",
        departmentId: eng.id,
        createdById: user.id,
        nextAgentId: atlas.id,
      },
    });
  } else {
    await prisma.agent.update({
      where: { id: pixel.id },
      data: { nextAgentId: atlas.id },
    });
  }

  let nova = await prisma.agent.findFirst({
    where: { name: "Nova", departmentId: eng.id },
  });
  if (!nova) {
    nova = await prisma.agent.create({
      data: {
        name: "Nova",
        role: "Backend Engineer",
        description: "API design and Node.js microservices.",
        systemPrompt:
          "You are Nova, a senior backend engineer. Focus on APIs, data modeling, and operational excellence.",
        departmentId: eng.id,
        createdById: user.id,
        nextAgentId: pixel.id,
      },
    });
  } else {
    await prisma.agent.update({
      where: { id: nova.id },
      data: { nextAgentId: pixel.id },
    });
  }

  const existingDemoTask = await prisma.task.findFirst({
    where: { title: "Launch readiness review" },
  });

  if (!existingDemoTask) {
    const task = await prisma.task.create({
      data: {
        title: "Launch readiness review",
        description: "CEO asks for a full engineering assessment before GA.",
        status: "completed",
        createdById: user.id,
        firstAgentId: nova.id,
        completedAt: new Date(),
        finalOutput:
          "## Output\nAtlas: Ship with staged rollout, feature flags on payments, and a 48h burn-in on staging. Risk budget acceptable.",
      },
    });

    const out1 = `## Output\nNova: Proposed REST contract for billing webhooks, idempotency keys, and Postgres outbox pattern. Redis cache for hot reads.`;
    const out2 = `## Output\nPixel: Dashboard shell with shadcn, optimistic UI for webhook status, and accessibility audit checklist complete.`;
    const out3 = task.finalOutput ?? "";

    await prisma.taskStep.createMany({
      data: [
        {
          taskId: task.id,
          agentId: nova.id,
          stepNumber: 1,
          input: task.description,
          output: out1,
          status: "completed",
          startedAt: new Date(Date.now() - 3600000),
          completedAt: new Date(Date.now() - 3500000),
          tokensUsed: 1200,
        },
        {
          taskId: task.id,
          agentId: pixel.id,
          stepNumber: 2,
          input: out1,
          output: out2,
          status: "completed",
          startedAt: new Date(Date.now() - 3400000),
          completedAt: new Date(Date.now() - 3300000),
          tokensUsed: 980,
        },
        {
          taskId: task.id,
          agentId: atlas.id,
          stepNumber: 3,
          input: out2,
          output: out3,
          status: "completed",
          startedAt: new Date(Date.now() - 3200000),
          completedAt: new Date(Date.now() - 3100000),
          tokensUsed: 1100,
        },
      ],
    });
  }

  console.log("Seed complete: demo@agentos.ai / Demo@1234");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
