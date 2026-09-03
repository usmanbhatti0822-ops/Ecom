export default function EmptyState({ title, subtitle, action }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      {subtitle && <p>{subtitle}</p>}
      {action}
    </div>
  );
}
