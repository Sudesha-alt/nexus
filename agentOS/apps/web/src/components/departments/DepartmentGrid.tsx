"use client";

import type { ComponentType } from "react";
import * as Icons from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { departmentAccent } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Dept = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  _count: { agents: number };
};

export function DepartmentGrid({ departments }: { departments: Dept[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {departments.map((d, i) => {
        const Icon =
          (Icons as unknown as Record<string, ComponentType<{ className?: string }>>)[
            d.icon
          ] ?? Icons.Building2;
        const hex = departmentAccent(d.slug);
        return (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${hex}22`, color: hex }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle>{d.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="line-clamp-2 text-xs">{d.description}</p>
                <p className="font-mono text-xs text-white/50">
                  {d._count.agents} agents
                </p>
                <Button type="button" variant="outline" size="sm" asChild>
                  <Link href={`/departments/${d.slug}`}>View Agents</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
