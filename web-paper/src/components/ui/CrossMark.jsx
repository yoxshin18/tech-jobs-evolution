/** Quadrato barrato posto sulle intersezioni della griglia. */
export default function CrossMark({ className = '' }) {
  return (
    <span aria-hidden="true" className={`block h-6 w-6 border border-line-strong bg-ink-950 ${className}`}>
      <svg viewBox="0 0 24 24" className="h-full w-full">
        <path d="M0 0 L24 24 M24 0 L0 24" stroke="#2A3A55" strokeWidth="1" />
        <circle cx="12" cy="12" r="1.6" fill="#64748B" />
      </svg>
    </span>
  );
}
