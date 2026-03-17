'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "../../shared/components/ui/button";
import { Input } from "../../shared/components/ui/input";
import { Label } from "../../shared/components/ui/label";
import { register as registerRequest } from "@/lib/auth";
import { ApiClientError } from "@/lib/api";
import {
  registerSchema,
  type RegisterFormValues,
} from "../schemas/registerSchema";

export function RegisterForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    try {
      await registerRequest(values);
      router.replace("/login");
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError("email", {
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      noValidate
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="first-name">First name</Label>
          <Input
            id="first-name"
            autoComplete="given-name"
            {...register("first_name")}
          />
          {errors.first_name && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.first_name.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="last-name">Last name</Label>
          <Input
            id="last-name"
            autoComplete="family-name"
            {...register("last_name")}
          />
          {errors.last_name && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.last_name.message}
            </p>
          )}
        </div>
      </div>

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
          autoComplete="new-password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button className="w-full" type="submit" disabled={isSubmitting}>
        Create account
      </Button>

      <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50"
        >
          Sign in
        </Link>
        .
      </p>
    </form>
  );
}

