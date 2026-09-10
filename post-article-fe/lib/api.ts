import type {
  Article,
  ArticleStatus,
  BaseResponse,
  CreateArticleRequest,
  UpdateArticleRequest,
} from "@/types/article";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8080";

export const PAGE_SIZE = 10;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = (await res.json().catch(() => null)) as BaseResponse<T> | null;
  if (!res.ok || !body?.success) {
    throw new Error(body?.error || body?.message || `Request failed (${res.status})`);
  }
  return body.data as T;
}

export const articleApi = {
  baseUrl: API_BASE,

  list(limit = PAGE_SIZE, offset = 0, status?: ArticleStatus) {
    const q = status ? `?status=${status}` : "";
    return request<Article[]>(`/article/${limit}/${offset}${q}`);
  },

  get(id: number) {
    return request<Article>(`/article/${id}`);
  },

  create(payload: CreateArticleRequest) {
    return request<Article>("/article", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update(id: number, payload: UpdateArticleRequest) {
    return request<Article>(`/article/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  /** Soft-delete: moves the record to trash (status -> thrash). */
  trash(id: number) {
    return request<{ id: number }>(`/article/${id}`, { method: "DELETE" });
  },

  /** Permanent delete (bypasses trash). Used from the Trash tab. */
  removePermanent(id: number) {
    return request<{ id: number }>(`/article/${id}?hard=true`, {
      method: "DELETE",
    });
  },

  /** Publish / draft / restore: full-object update keeping fields. */
  setStatus(article: Article, status: ArticleStatus) {
    return this.update(article.id, {
      title: article.title,
      content: article.content,
      category: article.category,
      status,
    });
  },
};
