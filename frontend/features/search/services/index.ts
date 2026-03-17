import { httpClient } from "@/features/services/httpClient";

export interface SearchResult {
  id: string;
  title: string;
  snippet: string;
}

export async function searchArticles(q: string): Promise<SearchResult[]> {
  const response = await httpClient.get<SearchResult[]>("/search", {
    params: { q },
  });
  return response.data;
}
