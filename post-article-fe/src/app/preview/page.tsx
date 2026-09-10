"use client";

import { useCallback, useEffect, useState } from "react";
import { articleApi, PAGE_SIZE, SEARCH_LIMIT } from "@/lib/api";
import type { Article } from "@/types/article";
import { PostCard } from "@/components/PostCard";
import { Pagination } from "@/components/Pagination";
import { SearchBox } from "@/components/SearchBox";
import { Alert, CardsSkeleton, EmptyState } from "@/components/feedback";

export default function PreviewPage() {
  const [posts, setPosts] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query.trim().toLowerCase());
      setPage(1);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const load = useCallback(async (p: number, q: string) => {
    setLoading(true);
    setError(null);
    try {
      // BE pagination (limit/offset) + status filter; FE paginates page-by-page.
      // Search is FE-only: pull a wider window, then match title/category.
      const data = q
        ? (await articleApi.list(SEARCH_LIMIT, 0, "publish")).filter(
            (a) =>
              a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q),
          )
        : await articleApi.list(PAGE_SIZE, (p - 1) * PAGE_SIZE, "publish");
      setPosts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load articles.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page, debouncedQuery);
  }, [page, debouncedQuery, load]);

  const searching = debouncedQuery.length > 0;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Preview</h1>
          <p className="muted">Published articles, {PAGE_SIZE} per page.</p>
        </div>
      </div>

      <div className="toolbar">
        <span className="muted">
          {searching ? `${posts.length} result${posts.length === 1 ? "" : "s"}` : ""}
        </span>
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="Search published articles…"
        />
      </div>

      <Alert message={error} />

      {loading ? (
        <CardsSkeleton />
      ) : posts.length === 0 ? (
        <EmptyState
          message={searching ? `No results for "${query.trim()}".` : "No published articles yet."}
        />
      ) : (
        <>
          <div className="grid">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
          {!searching && (
            <Pagination
              page={page}
              hasNext={posts.length >= PAGE_SIZE}
              shown={posts.length}
              onPrev={() => setPage((v) => Math.max(1, v - 1))}
              onNext={() => setPage((v) => v + 1)}
            />
          )}
        </>
      )}
    </>
  );
}
