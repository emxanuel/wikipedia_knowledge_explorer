import { httpClient } from "@/features/services/httpClient";

export interface SavedArticleCreate {
  title: string;
  wikipedia_id: string;
  url: string;
  summary: string;
}

export interface SavedArticleRead {
  id: number;
  title: string;
  wikipedia_id: string;
  url: string;
  summary: string;
}

export async function saveArticle(
  data: SavedArticleCreate,
): Promise<SavedArticleRead> {
  const response = await httpClient.post<SavedArticleRead>(
    "/saved_articles",
    data,
  );
  return response.data;
}

export async function getSavedArticles(): Promise<SavedArticleRead[]> {
  const response = await httpClient.get<SavedArticleRead[]>("/saved_articles");
  return response.data;
}

export async function deleteSavedArticle(id: number): Promise<void> {
  await httpClient.delete(`/saved_articles/${id}`);
}
