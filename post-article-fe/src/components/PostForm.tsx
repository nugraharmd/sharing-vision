"use client";

import { useState } from "react";
import type { ArticleStatus } from "@/types/article";
import {
  validateArticleForm,
  type ArticleFormErrors,
  type ArticleFormValues,
} from "@/lib/validation";

interface PostFormProps {
  initial?: ArticleFormValues;
  submitting?: boolean;
  serverError?: string | null;
  onSubmit: (values: ArticleFormValues, status: ArticleStatus) => void;
}

const EMPTY: ArticleFormValues = { title: "", content: "", category: "" };

export function PostForm({ initial = EMPTY, submitting = false, serverError = null, onSubmit }: PostFormProps) {
  const [values, setValues] = useState<ArticleFormValues>(initial);
  const [errors, setErrors] = useState<ArticleFormErrors>({});

  function set<K extends keyof ArticleFormValues>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSubmit(status: ArticleStatus) {
    const errs = validateArticleForm(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSubmit(
      { title: values.title.trim(), content: values.content.trim(), category: values.category.trim() },
      status,
    );
  }

  return (
    <form className="form" noValidate onSubmit={(e) => e.preventDefault()}>
      {serverError && (
        <div className="alert alert--error" role="alert">
          {serverError}
        </div>
      )}

      <div className="field">
        <label htmlFor="title">Title (min 20 characters)</label>
        <input
          id="title"
          type="text"
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="A descriptive article title…"
        />
        {errors.title && <span className="field__error">{errors.title}</span>}
      </div>

      <div className="field">
        <label htmlFor="content">Content (min 200 characters)</label>
        <textarea
          id="content"
          rows={10}
          value={values.content}
          onChange={(e) => set("content", e.target.value)}
          placeholder="Write the full article content…"
        />
        <span className="field__hint">{values.content.trim().length}/200 min characters</span>
        {errors.content && <span className="field__error">{errors.content}</span>}
      </div>

      <div className="field">
        <label htmlFor="category">Category (min 3 characters)</label>
        <input
          id="category"
          type="text"
          value={values.category}
          onChange={(e) => set("category", e.target.value)}
          placeholder="e.g. Technology"
        />
        {errors.category && <span className="field__error">{errors.category}</span>}
      </div>

      <div className="form__actions">
        <button
          type="button"
          className="btn btn--primary"
          disabled={submitting}
          onClick={() => handleSubmit("publish")}
        >
          {submitting ? "Saving…" : "Publish"}
        </button>
        <button
          type="button"
          className="btn btn--secondary"
          disabled={submitting}
          onClick={() => handleSubmit("draft")}
        >
          {submitting ? "Saving…" : "Save as Draft"}
        </button>
      </div>
    </form>
  );
}
