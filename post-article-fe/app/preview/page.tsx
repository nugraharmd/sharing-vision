"use client";

import { useCallback, useEffect, useState } from "react";
import { articleApi, PAGE_SIZE } from "@/lib/api";
import type { Article } from "@/types/article";
import { PostCard } from "@/components/PostCard";
import { Pagination } from "@/components/Pagination";
import { Alert, EmptyState, Loading } from "@/components/feedback";

export default function PreviewPage() {
  const [posts, setPosts] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      // BE pagination (limit/offset) + status filter; FE paginates page-by-page.
      const data = await articleApi.list(PAGE_SIZE, (p - 1) * PAGE_SIZE, "publish");
      setPosts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load articles.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page);
  }, [page, load]);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Preview</h1>
          <p className="muted">Published articles, {PAGE_SIZE} per page.</p>
        </div>
      </div>

      <Alert message={error} />

      {loading ? (
        <Loading label="Loading articles…" />
      ) : posts.length === 0 ? (
        <EmptyState message="No published articles yet." />
      ) : (
        <>
          <div className="grid">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
          <Pagination
            page={page}
            hasNext={posts.length >= PAGE_SIZE}
            shown={posts.length}
            onPrev={() => setPage((v) => Math.max(1, v - 1))}
            onNext={() => setPage((v) => v + 1)}
          />
        </>
      )}
    </>
  );
}
