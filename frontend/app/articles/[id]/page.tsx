"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AxiosError } from "axios";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { getArticle, type ArticleDetail } from "@/features/articles/services";

export default function ArticlePage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Missing article id");
      return;
    }
    setLoading(true);
    setError(null);
    getArticle(id)
      .then(setArticle)
      .catch((err) => {
        if (err instanceof AxiosError && err.response?.status === 404) {
          setError("Article not found.");
        } else {
          setError(
            err instanceof Error ? err.message : "Failed to load article.",
          );
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
        <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950 md:px-6 md:py-4">
          <Link
            href="/"
            className="shrink-0 text-sm font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-300"
          >
            Back to search
          </Link>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-8">
          {loading && (
            <div className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Loading article…
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col gap-4 py-8">
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {error}
              </p>
              <Link
                href="/"
                className="text-sm font-medium text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
              >
                Back to search
              </Link>
            </div>
          )}

          {article && !loading && (
            <article className="flex flex-col gap-6">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                {article.title}
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                {article.summary}
              </p>
              <dl className="flex flex-col gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800 dark:pt-4">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Word count
                  </dt>
                  <dd className="mt-0.5 text-sm text-zinc-900 dark:text-zinc-50">
                    {article.word_count}
                  </dd>
                </div>
                {article.top_words.length > 0 && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Top words
                    </dt>
                    <dd className="mt-0.5 flex flex-wrap gap-2">
                      {article.top_words.map((w) => (
                        <span
                          key={w}
                          className="rounded-md bg-zinc-200 px-2 py-0.5 text-sm text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200"
                        >
                          {w}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
              <a
                href={article.wikipedia_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
              >
                Read on Wikipedia
              </a>
            </article>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
