export interface ArticleFormValues {
  title: string;
  content: string;
  category: string;
}

export type ArticleFormErrors = Partial<Record<keyof ArticleFormValues, string>>;

// Mirrors BE validation (internal/dto): title min 20, content min 200, category min 3.
export function validateArticleForm(values: ArticleFormValues): ArticleFormErrors {
  const errors: ArticleFormErrors = {};
  const title = values.title.trim();
  const content = values.content.trim();
  const category = values.category.trim();

  if (!title) errors.title = "Title is required.";
  else if (title.length < 20) errors.title = "Title must be at least 20 characters.";

  if (!content) errors.content = "Content is required.";
  else if (content.length < 200)
    errors.content = "Content must be at least 200 characters.";

  if (!category) errors.category = "Category is required.";
  else if (category.length < 3)
    errors.category = "Category must be at least 3 characters.";

  return errors;
}
