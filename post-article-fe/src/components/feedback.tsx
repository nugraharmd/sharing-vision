export function Alert({ message }: { message: string | null }) {
  if (!message) return null;
  return <div className="alert alert--error" role="alert">{message}</div>;
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return <div className="loading" aria-busy="true">{label}</div>;
}

export function EmptyState({ message }: { message: string }) {
  return <div className="empty">{message}</div>;
}

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="toast" role="status">
      {message}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="table-wrap" aria-busy="true" aria-label="Loading posts">
      <div className="skeleton-rows">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton skeleton--row" />
        ))}
      </div>
    </div>
  );
}

export function CardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid" aria-busy="true" aria-label="Loading articles">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton skeleton--card" />
      ))}
    </div>
  );
}
