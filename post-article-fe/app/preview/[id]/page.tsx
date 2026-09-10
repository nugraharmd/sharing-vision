"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { articleApi } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Article } from "@/types/article";
import { StatusBadge } from "@/components/StatusBadge";
import { Alert, Loading } from "@/components/feedback";

export default function PreviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [post, setPost] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    articleApi
      .get(Number(id))
      .then(setPost)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Failed to load article."),
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading label="Loading article…" />;
  if (error || !post) return <Alert message={error ?? "Article not found."} />;

  return (
    <article className="blog">
      <Link href="/preview" className="btn btn--secondary">
        ← Back to Preview
      </Link>
      <span className="category">{post.category}</span>
      <h1 className="blog__title">{post.title}</h1>
      <div className="blog__meta">
        <StatusBadge status={post.status} />
        <span className="muted">{formatDate(post.created_date)}</span>
      </div>
      <div className="blog__content">{post.content}</div>
    </article>
  );
}
