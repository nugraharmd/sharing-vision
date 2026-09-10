interface PaginationProps {
  page: number;
  hasNext: boolean;
  shown: number;
  onPrev: () => void;
  onNext: () => void;
}

export function Pagination({ page, hasNext, shown, onPrev, onNext }: PaginationProps) {
  return (
    <div className="pagination">
      <button className="btn btn--secondary" onClick={onPrev} disabled={page <= 1}>
        ← Previous
      </button>
      <span className="pagination__info">
        Page {page} · showing {shown}
      </span>
      <button className="btn btn--secondary" onClick={onNext} disabled={!hasNext}>
        Next →
      </button>
    </div>
  );
}
