"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { articleApi, PAGE_SIZE, SEARCH_LIMIT } from "@/lib/api";
import { TABS, type Article, type TabKey } from "@/types/article";
import { Tabs } from "@/components/Tabs";
import { PostTable } from "@/components/PostTable";
import { Pagination } from "@/components/Pagination";
import { SearchBox } from "@/components/SearchBox";
import { Alert, EmptyState, Loading, TableSkeleton, Toast } from "@/components/feedback";

function isTabKey(v: string | null): v is TabKey {
  return v === "publish" || v === "draft" || v === "trash";
}

/** FE-only search: matches title + category (BE has no search endpoint). */
function matches(post: Article, q: string): boolean {
  return (
    post.title.toLowerCase().includes(q) || post.category.toLowerCase().includes(q)
  );
}

function AllPostsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<TabKey>(
    isTabKey(searchParams.get("tab")) ? (searchParams.get("tab") as TabKey) : "publish",
  );
  const [posts, setPosts] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  // Debounce the search input so we don't refetch on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query.trim().toLowerCase());
      setPage(1);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const load = useCallback(async (status: TabKey, p: number, q: string, quiet = false) => {
    if (!quiet) setLoading(true);
    setError(null);
    try {
      const data = q
        ? (await articleApi.list(SEARCH_LIMIT, 0, status)).filter((a) => matches(a, q))
        : await articleApi.list(PAGE_SIZE, (p - 1) * PAGE_SIZE, status);
      setPosts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load posts.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(tab, page, debouncedQuery);
  }, [tab, page, debouncedQuery, load]);

  function changeTab(next: TabKey) {
    setTab(next);
    setPage(1);
  }

  interface MutateOpts {
    confirmMsg?: string;
    successMsg?: string;
  }

  async function mutate(id: number, fn: (p: Article) => Promise<unknown>, opts: MutateOpts = {}) {
    const target = posts.find((p) => p.id === id);
    if (!target) return;
    if (opts.confirmMsg && !window.confirm(opts.confirmMsg)) return;
    // Optimistic update: the item leaves this status-filtered tab immediately.
    const snapshot = posts;
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setBusyId(id);
    setError(null);
    try {
      await fn(target);
      if (opts.successMsg) setToast(opts.successMsg);
      await load(tab, page, debouncedQuery, true);
    } catch (e) {
      setPosts(snapshot); // roll back on failure
      setError(e instanceof Error ? e.message : "Action failed.");
    } finally {
      setBusyId(null);
    }
  }

  const searching = debouncedQuery.length > 0;
  const hasNext = !searching && posts.length >= PAGE_SIZE;

  return (
    <>
      <div className="page-head">
        <h1>All Posts</h1>
        <button className="btn btn--primary" onClick={() => router.push("/posts/new")}>
          + Create Article
        </button>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={changeTab} />

      <div className="toolbar">
        <span className="muted">
          {searching ? `${posts.length} result${posts.length === 1 ? "" : "s"}` : ""}
        </span>
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder={`Search ${tab === "publish" ? "published" : tab} posts…`}
        />
      </div>

      <Alert message={error} />
      <Toast message={toast} />

      {loading ? (
        <TableSkeleton />
      ) : posts.length === 0 ? (
        <EmptyState
          message={
            searching
              ? `No results for "${query.trim()}".`
              : `No ${tab === "publish" ? "published" : tab} posts yet.`
          }
        />
      ) : (
        <>
          <PostTable
            posts={posts}
            trashed={tab === "trash"}
            busyId={busyId}
            onEdit={(p) => router.push(`/posts/${p.id}/edit`)}
            onPublish={(p) =>
              mutate(p.id, (t) => articleApi.setStatus(t, "publish"), {
                successMsg: "Article published.",
              })
            }
            onDraft={(p) =>
              mutate(p.id, (t) => articleApi.setStatus(t, "draft"), {
                successMsg: "Moved to draft.",
              })
            }
            onTrash={(p) =>
              mutate(p.id, (t) => articleApi.trash(t.id), {
                confirmMsg: `Move "${p.title}" to trash?`,
                successMsg: "Moved to trash.",
              })
            }
            onPermanentDelete={(p) =>
              mutate(p.id, (t) => articleApi.removePermanent(t.id), {
                confirmMsg: `Permanently delete "${p.title}"? This cannot be undone.`,
                successMsg: "Permanently deleted.",
              })
            }
          />
          {!searching && (
            <Pagination
              page={page}
              hasNext={hasNext}
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

export default function AllPostsPage() {
  return (
    <Suspense fallback={<Loading label="Loading posts…" />}>
      <AllPostsInner />
    </Suspense>
  );
}
