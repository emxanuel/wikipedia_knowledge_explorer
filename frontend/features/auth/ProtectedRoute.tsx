'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const currentPath = searchParams?.get("redirect") ?? "/";
      const encoded = encodeURIComponent(currentPath);
      router.replace(`/login?redirect=${encoded}`);
    }
  }, [user, loading, router, searchParams]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="flex flex-col items-center gap-3 rounded-lg bg-white px-6 py-4 shadow-sm dark:bg-zinc-900">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Loading your workspace...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

