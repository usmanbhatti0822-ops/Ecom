export default function QuantityStepper({ value, onChange, max = 99, min = 1 }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)' }}>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>−</button>
      <span style={{ minWidth: 32, textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{value}</span>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>+</button>
    </div>
  );
}
