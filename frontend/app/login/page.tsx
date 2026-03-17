import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/LoginForm";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/features/shared/components/ui/card";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 font-sans dark:bg-black">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
              Wikipedia Knowledge Explorer
            </p>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Enter your email and password to access your workspace.
            </CardDescription>
          </CardHeader>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}

