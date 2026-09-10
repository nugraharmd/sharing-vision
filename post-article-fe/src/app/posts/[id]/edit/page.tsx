"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { articleApi } from "@/lib/api";
import type { ArticleFormValues } from "@/lib/validation";
import type { Article, ArticleStatus } from "@/types/article";
import { PostForm } from "@/components/PostForm";
import { Alert, Loading } from "@/components/feedback";

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    articleApi
      .get(Number(id))
      .then(setPost)
      .catch((e: unknown) =>
        setServerError(e instanceof Error ? e.message : "Failed to load article."),
      )
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(values: ArticleFormValues, status: ArticleStatus) {
    if (!post) return;
    setSubmitting(true);
    setServerError(null);
    try {
      await articleApi.update(post.id, { ...values, status });
      router.push(`/posts?tab=${status === "trash" ? "draft" : status}`);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Failed to update article.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTrash() {
    if (!post) return;
    if (!window.confirm(`Move "${post.title}" to trash?`)) return;
    setSubmitting(true);
    setServerError(null);
    try {
      await articleApi.trash(post.id);
      router.push("/posts?tab=trash");
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Failed to move article to trash.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Loading label="Loading article…" />;
  if (!post) return <Alert message={serverError ?? "Article not found."} />;

  return (
    <>
      <div className="page-head">
        <h1>Edit Article</h1>
        <button
          type="button"
          className="btn btn--danger-outline"
          disabled={submitting}
          onClick={handleTrash}
        >
          Move to Trash
        </button>
      </div>
      <PostForm
        initial={{ title: post.title, content: post.content, category: post.category }}
        submitting={submitting}
        serverError={serverError}
        onSubmit={handleSubmit}
      />
    </>
  );
}
