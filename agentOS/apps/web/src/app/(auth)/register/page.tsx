"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { registerSchema, type RegisterInput } from "@agentos/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function RegisterPage() {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const { register, handleSubmit } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create CEO account</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={handleSubmit(async (data) => {
              setErr(null);
              const res = await fetch(`${apiUrl}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
              });
              if (!res.ok) {
                const j = (await res.json()) as { error?: string };
                setErr(j.error ?? "Registration failed");
                return;
              }
              router.push("/login");
            })}
          >
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" className="mt-1" {...register("name")} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" className="mt-1" {...register("email")} />
            </div>
            <div>
              <Label htmlFor="password">Password (min 8)</Label>
              <Input
                id="password"
                type="password"
                className="mt-1"
                {...register("password")}
              />
            </div>
            {err ? <p className="text-xs text-error">{err}</p> : null}
            <Button type="submit" className="w-full">
              Register
            </Button>
            <p className="text-center text-xs text-white/50">
              <Link href="/login" className="text-accent hover:underline">
                Back to login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
