import type { ArticleStatus } from "@/types/article";

const LABELS: Record<ArticleStatus, string> = {
  publish: "Published",
  draft: "Draft",
  thrash: "Trashed",
};

export function StatusBadge({ status }: { status: ArticleStatus }) {
  return <span className={`badge badge--${status}`}>{LABELS[status]}</span>;
}
