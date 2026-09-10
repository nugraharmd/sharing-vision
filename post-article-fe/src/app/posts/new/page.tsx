"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { articleApi } from "@/lib/api";
import type { ArticleFormValues } from "@/lib/validation";
import type { ArticleStatus } from "@/types/article";
import { PostForm } from "@/components/PostForm";

export default function CreateArticlePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(values: ArticleFormValues, status: ArticleStatus) {
    setSubmitting(true);
    setServerError(null);
    try {
      await articleApi.create({ ...values, status });
      router.push(`/posts?tab=${status === "trash" ? "draft" : status}`);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Failed to create article.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Create Article</h1>
      </div>
      <PostForm submitting={submitting} serverError={serverError} onSubmit={handleSubmit} />
    </>
  );
}
