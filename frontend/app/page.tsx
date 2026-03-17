'use client';

import { useRouter } from "next/navigation";
import { ProtectedRoute } from "../features/auth/ProtectedRoute";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await logout();
    router.replace("/login");
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="flex w-full max-w-3xl flex-col gap-8 rounded-2xl bg-white px-8 py-12 shadow-sm dark:bg-zinc-950 md:px-12 md:py-16">
          <header className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                Wikipedia Knowledge Explorer
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                Welcome back{user ? `, ${user.first_name}` : ""}.
              </h1>
              <p className="max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
                You&apos;re signed in and ready to start exploring articles,
                building collections, and discovering new connections.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="text-sm font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-300"
            >
              Sign out
            </button>
          </header>
        </main>
      </div>
    </ProtectedRoute>
  );
}


