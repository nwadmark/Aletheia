export interface Article {
  id: string;
  title: string;
  summary: string;
  url: string;
  image_url: string | null;
  source: string;
  category: string;
  published_at: string;
  created_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchArticles(
  category?: string,
  limit: number = 10,
  skip: number = 0
): Promise<Article[]> {
  const params = new URLSearchParams();
  if (category && category !== 'All') {
    params.append('category', category);
  }
  params.append('limit', limit.toString());
  params.append('skip', skip.toString());

  const response = await fetch(`${API_URL}/api/articles/?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch articles');
  }

  return response.json();
}

export async function refreshArticles(): Promise<{ message: string; new_articles_count: number }> {
  const response = await fetch(`${API_URL}/api/articles/refresh`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to refresh articles');
  }

  return response.json();
}