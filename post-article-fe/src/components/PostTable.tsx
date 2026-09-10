"use client";

import type { Article } from "@/types/article";
import { formatDate } from "@/lib/format";
import { IconButton } from "@/components/IconButton";
import { DraftIcon, EditIcon, PublishIcon, TrashIcon } from "@/components/icons";

interface PostTableProps {
  posts: Article[];
  trashed?: boolean;
  busyId?: number | null;
  onEdit: (post: Article) => void;
  onPublish: (post: Article) => void;
  onDraft: (post: Article) => void;
  onTrash: (post: Article) => void;
  onPermanentDelete: (post: Article) => void;
}

export function PostTable({
  posts,
  trashed = false,
  busyId = null,
  onEdit,
  onPublish,
  onDraft,
  onTrash,
  onPermanentDelete,
}: PostTableProps) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Updated</th>
            <th className="th-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((p) => {
            const busy = busyId === p.id;
            return (
              <tr key={p.id}>
                <td className="td-title">{p.title}</td>
                <td>
                  <span className="category">{p.category}</span>
                </td>
                <td className="td-date">{formatDate(p.updated_date)}</td>
                <td>
                  <div className="actions">
                    <IconButton
                      title="Edit"
                      label={`Edit ${p.title}`}
                      disabled={busy}
                      onClick={() => onEdit(p)}
                    >
                      <EditIcon />
                    </IconButton>
                    {!trashed && p.status !== "publish" && (
                      <IconButton
                        title="Publish"
                        label={`Publish ${p.title}`}
                        variant="success"
                        disabled={busy}
                        onClick={() => onPublish(p)}
                      >
                        <PublishIcon />
                      </IconButton>
                    )}
                    {!trashed && p.status !== "draft" && (
                      <IconButton
                        title="Move to Draft"
                        label={`Move ${p.title} to draft`}
                        disabled={busy}
                        onClick={() => onDraft(p)}
                      >
                        <DraftIcon />
                      </IconButton>
                    )}
                    {trashed && (
                      <>
                        <IconButton
                          title="Publish"
                          label={`Restore and publish ${p.title}`}
                          variant="success"
                          disabled={busy}
                          onClick={() => onPublish(p)}
                        >
                          <PublishIcon />
                        </IconButton>
                        <IconButton
                          title="Move to Draft"
                          label={`Restore ${p.title} to draft`}
                          disabled={busy}
                          onClick={() => onDraft(p)}
                        >
                          <DraftIcon />
                        </IconButton>
                        <IconButton
                          title="Delete permanently"
                          label={`Delete ${p.title} permanently`}
                          variant="danger"
                          disabled={busy}
                          onClick={() => onPermanentDelete(p)}
                        >
                          <TrashIcon />
                        </IconButton>
                      </>
                    )}
                    {!trashed && (
                      <IconButton
                        title="Move to Trash"
                        label={`Move ${p.title} to trash`}
                        variant="danger"
                        disabled={busy}
                        onClick={() => onTrash(p)}
                      >
                        <TrashIcon />
                      </IconButton>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
