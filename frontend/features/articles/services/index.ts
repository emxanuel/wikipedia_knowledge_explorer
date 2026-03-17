import { httpClient } from "@/features/services/httpClient";

export interface ArticleDetail {
  title: string;
  summary: string;
  word_count: number;
  top_words: string[];
  wikipedia_url: string;
}

export async function getArticle(id: string): Promise<ArticleDetail> {
  const response = await httpClient.get<ArticleDetail>(`/articles/${id}`);
  return response.data;
}
