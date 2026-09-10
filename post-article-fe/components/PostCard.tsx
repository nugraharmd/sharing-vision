import Link from "next/link";
import type { Article } from "@/types/article";
import { excerpt, formatDate } from "@/lib/format";

export function PostCard({ post }: { post: Article }) {
  return (
    <Link href={`/preview/${post.id}`} className="card">
      <span className="category">{post.category}</span>
      <h3 className="card__title">{post.title}</h3>
      <p className="card__excerpt">{excerpt(post.content)}</p>
      <span className="card__date">{formatDate(post.created_date)}</span>
    </Link>
  );
}
