import { RegisterForm } from "@/features/auth/components/RegisterForm";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/features/shared/components/ui/card";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 font-sans dark:bg-black">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
              Wikipedia Knowledge Explorer
            </p>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>
              Start exploring and organizing articles with your own workspace.
            </CardDescription>
          </CardHeader>
          <RegisterForm />
        </Card>
      </div>
    </div>
  );
}

