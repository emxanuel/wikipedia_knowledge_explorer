'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { ProtectedRoute } from "../features/auth/ProtectedRoute";
import { useAuth } from "../contexts/AuthContext";
import { SearchBar } from "../features/search/components/SearchBar";
import { SearchResults } from "../features/search/components/SearchResults";
import { searchArticles, type SearchResult } from "../features/search/services";

export default function Home() {
  const { logout } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    await logout();
    router.replace("/login");
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setError(null);
    setLoading(true);
    setResults(null);
    try {
      const data = await searchArticles(q);
      setResults(data);
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data?.detail) {
        const detail = err.response.data.detail;
        setError(typeof detail === "string" ? detail : "Search failed.");
      } else {
        setError(
          err instanceof Error ? err.message : "Search failed. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
        <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950 md:px-6 md:py-4">
          <p className="shrink-0 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Wikipedia Knowledge Explorer
          </p>
          <SearchBar
            value={query}
            onChange={setQuery}
            onSubmit={handleSearch}
            loading={loading}
          />
          <button
            type="button"
            onClick={handleSignOut}
            className="shrink-0 text-sm font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-300"
          >
            Sign out
          </button>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-8">
          <SearchResults results={results} loading={loading} error={error} />
        </main>
      </div>
    </ProtectedRoute>
  );
}
