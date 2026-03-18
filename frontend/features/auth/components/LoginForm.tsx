'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "../../shared/components/ui/button";
import { Input } from "../../shared/components/ui/input";
import { Label } from "../../shared/components/ui/label";
import { useAuth } from "../../../contexts/AuthContext";
import { ApiClientError } from "../../../lib/api";
import {
  loginSchema,
  type LoginFormValues,
} from "../schemas/loginSchema";
import Link from "next/link";

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      await login(values);
      const redirect = searchParams.get("redirect") || "/";
      router.replace(redirect);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError("password", {
          type: "server",
          message: err.payload?.message ?? err.message,
        });
      } else {
        setError("password", {
          type: "server",
          message: "Something went wrong. Please try again.",
        });
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button className="w-full" type="submit" disabled={isSubmitting}>
        Sign in
      </Button>
      <p className="text-sm text-center text-zinc-600 dark:text-zinc-400">
        Don&apos;t have an account? <Link href="/register">Register</Link>
      </p>.
    </form>
  );
}

