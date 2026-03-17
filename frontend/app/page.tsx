'use client';

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "../features/auth/ProtectedRoute";
import { useAuth } from "../contexts/AuthContext";
import { SearchBar } from "../features/search/components/SearchBar";
import { SearchResults } from "../features/search/components/SearchResults";
import { searchArticles, type SearchResult } from "../features/search/services";
import {
  deleteSavedArticle,
  getSavedArticles,
  type SavedArticleRead,
} from "../features/saved_articles/services";
import { Button } from "../features/shared/components/ui/button";

export default function Home() {
  const { logout } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedArticles, setSavedArticles] = useState<SavedArticleRead[] | null>(
    null,
  );
  const [savedLoading, setSavedLoading] = useState(true);
  const [savedError, setSavedError] = useState<string | null>(null);

  const fetchSavedArticles = useCallback(async () => {
    setSavedError(null);
    try {
      const data = await getSavedArticles();
      setSavedArticles(data);
    } catch (err) {
      setSavedError(
        err instanceof Error ? err.message : "Failed to load saved articles.",
      );
    } finally {
      setSavedLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedArticles();
  }, [fetchSavedArticles]);

  async function handleRemoveSaved(id: number) {
    try {
      await deleteSavedArticle(id);
      setSavedArticles((prev) => (prev ?? []).filter((a) => a.id !== id));
    } catch (err) {
      setSavedError(
        err instanceof Error ? err.message : "Failed to remove article.",
      );
    }
  }

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
      setError(
        err instanceof Error ? err.message : "Search failed. Please try again.",
      );
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

        <main className="mx-auto max-w-3xl space-y-8 px-4 py-6 md:px-6 md:py-8">
          {!loading && results === null && (
            <section>
              <h2 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Saved articles
              </h2>
              {savedLoading && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Loading…
                </p>
              )}
              {savedError && !savedLoading && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {savedError}
                </p>
              )}
              {!savedLoading && !savedError && savedArticles?.length === 0 && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  You haven&apos;t saved any articles yet. Open an article and
                  click Save to add it here.
                </p>
              )}
              {!savedLoading && savedArticles && savedArticles.length > 0 && (
                <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
                  {savedArticles.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start justify-between gap-3 py-3 first:pt-0"
                    >
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/articles/${item.wikipedia_id}`}
                          className="text-base font-medium text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {item.title}
                        </Link>
                        {item.summary && (
                          <p className="mt-0.5 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                            {item.summary}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSaved(item.id)}
                        className="shrink-0 text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          <section>
            {(loading || results !== null) && (
              <h2 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Search
              </h2>
            )}
            <SearchResults
              results={results}
              loading={loading}
              error={error}
            />
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}
