"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { articleApi, PAGE_SIZE } from "@/lib/api";
import { TABS, type Article, type TabKey } from "@/types/article";
import { Tabs } from "@/components/Tabs";
import { PostTable } from "@/components/PostTable";
import { Pagination } from "@/components/Pagination";
import { Alert, EmptyState, Loading } from "@/components/feedback";

function isTabKey(v: string | null): v is TabKey {
  return v === "publish" || v === "draft" || v === "thrash";
}

function AllPostsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<TabKey>(
    isTabKey(searchParams.get("tab")) ? (searchParams.get("tab") as TabKey) : "publish",
  );
  const [posts, setPosts] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async (status: TabKey, p: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await articleApi.list(PAGE_SIZE, (p - 1) * PAGE_SIZE, status);
      setPosts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load posts.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(tab, page);
  }, [tab, page, load]);

  function changeTab(next: TabKey) {
    setTab(next);
    setPage(1);
  }

  async function mutate(id: number, fn: (p: Article) => Promise<unknown>, confirmMsg?: string) {
    const target = posts.find((p) => p.id === id);
    if (!target) return;
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setBusyId(id);
    setError(null);
    try {
      await fn(target);
      await load(tab, page);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed.");
    } finally {
      setBusyId(null);
    }
  }

  const hasNext = posts.length >= PAGE_SIZE;

  return (
    <>
      <div className="page-head">
        <h1>All Posts</h1>
        <button className="btn btn--primary" onClick={() => router.push("/posts/new")}>
          + Create Article
        </button>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={changeTab} />
      <Alert message={error} />

      {loading ? (
        <Loading label="Loading posts…" />
      ) : posts.length === 0 ? (
        <EmptyState message={`No ${tab === "publish" ? "published" : tab} posts yet.`} />
      ) : (
        <>
          <PostTable
            posts={posts}
            trashed={tab === "thrash"}
            busyId={busyId}
            onEdit={(p) => router.push(`/posts/${p.id}/edit`)}
            onPublish={(p) => mutate(p.id, (t) => articleApi.setStatus(t, "publish"))}
            onDraft={(p) => mutate(p.id, (t) => articleApi.setStatus(t, "draft"))}
            onTrash={(p) =>
              mutate(p.id, (t) => articleApi.trash(t.id), `Move "${p.title}" to trash?`)
            }
            onPermanentDelete={(p) =>
              mutate(
                p.id,
                (t) => articleApi.removePermanent(t.id),
                `Permanently delete "${p.title}"? This cannot be undone.`,
              )
            }
          />
          <Pagination
            page={page}
            hasNext={hasNext}
            shown={posts.length}
            onPrev={() => setPage((v) => Math.max(1, v - 1))}
            onNext={() => setPage((v) => v + 1)}
          />
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
