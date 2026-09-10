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
