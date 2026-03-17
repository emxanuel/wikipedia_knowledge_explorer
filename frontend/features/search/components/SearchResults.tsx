"use client";

import type { SearchResult } from "@/features/search/services";

export interface SearchResultsProps {
  results: SearchResult[] | null;
  loading: boolean;
  error: string | null;
}

export function SearchResults({
  results,
  loading,
  error,
}: SearchResultsProps) {
  if (error) {
    return (
      <p
        className="py-4 text-sm text-red-600 dark:text-red-400"
        role="alert"
      >
        {error}
      </p>
    );
  }

  if (loading) {
    return (
      <div className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Searching…
      </div>
    );
  }

  if (results === null) {
    return null;
  }

  if (results.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
        No articles found. Try a different query.
      </p>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800" role="list">
      {results.map((item) => (
        <li key={item.id} className="py-4 first:pt-0">
          <p className="text-lg font-medium text-blue-600 dark:text-blue-400">
            {item.title}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            en.wikipedia.org
          </p>
          {item.snippet && (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
              {item.snippet}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
