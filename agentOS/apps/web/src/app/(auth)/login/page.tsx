"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { loginSchema, type LoginInput } from "@agentos/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const { register, handleSubmit } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in to AgentOS</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={handleSubmit(async (data) => {
              setErr(null);
              const res = await signIn("credentials", {
                redirect: false,
                email: data.email,
                password: data.password,
              });
              if (res?.error) {
                setErr("Invalid email or password");
                return;
              }
              router.push("/dashboard");
              router.refresh();
            })}
          >
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" className="mt-1" {...register("email")} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                className="mt-1"
                {...register("password")}
              />
            </div>
            {err ? <p className="text-xs text-error">{err}</p> : null}
            <Button type="submit" className="w-full">
              Sign in
            </Button>
            <p className="text-center text-xs text-white/50">
              No account?{" "}
              <Link href="/register" className="text-accent hover:underline">
                Register
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
