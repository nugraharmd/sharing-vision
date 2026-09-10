// DTOs mirroring post-article-be (Go: internal/dto + pkg/response).

export type ArticleStatus = "publish" | "draft" | "thrash";

export const STATUSES: ArticleStatus[] = ["publish", "draft", "thrash"];

export interface Article {
  id: number;
  title: string;
  content: string;
  category: string;
  status: ArticleStatus;
  created_date: string;
  updated_date: string;
}

export interface PageMeta {
  limit: number;
  offset: number;
  count: number;
}

/** Base response envelope shared by every BE microservice. */
export interface BaseResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: PageMeta | null;
  error?: string;
}

export interface CreateArticleRequest {
  title: string;
  content: string;
  category: string;
  status: ArticleStatus;
}

export type UpdateArticleRequest = CreateArticleRequest;

export type TabKey = "publish" | "draft" | "thrash";

export const TABS: { key: TabKey; label: string }[] = [
  { key: "publish", label: "Published" },
  { key: "draft", label: "Draft" },
  { key: "thrash", label: "Trashed" },
];
