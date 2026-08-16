import React from 'react';

const Pagination: React.FC<{
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}> = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  let last = 0;
  return (
    <div className="mt-8 flex items-center justify-center gap-1">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="rounded-md border border-brand-200 px-3 py-1.5 text-sm text-brand-700 disabled:opacity-40"
      >
        Prev
      </button>
      {pages.map((p) => {
        const showEllipsis = p - last > 1;
        last = p;
        return (
          <React.Fragment key={p}>
            {showEllipsis && <span className="px-1 text-ink/40">…</span>}
            <button
              onClick={() => onChange(p)}
              className={`h-8 w-8 rounded-md text-sm font-medium ${
                p === page ? 'bg-brand-500 text-white' : 'text-ink/70 hover:bg-brand-50'
              }`}
            >
              {p}
            </button>
          </React.Fragment>
        );
      })}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="rounded-md border border-brand-200 px-3 py-1.5 text-sm text-brand-700 disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
