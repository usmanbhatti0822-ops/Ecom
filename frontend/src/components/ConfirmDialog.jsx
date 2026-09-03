export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', danger = false }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,24,26,0.45)', zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onCancel}>
      <div className="card" style={{ maxWidth: 380, width: '100%' }} onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
