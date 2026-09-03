export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 32 }}>
      <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>Prev</button>
      {pages.map((p, i) => (
        <span key={p} style={{ display: 'flex', alignItems: 'center' }}>
          {i > 0 && pages[i - 1] !== p - 1 && <span style={{ padding: '0 4px', color: 'var(--ink-faint)' }}>…</span>}
          <button
            className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => onChange(p)}
          >{p}</button>
        </span>
      ))}
      <button className="btn btn-outline btn-sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Next</button>
    </div>
  );
}
