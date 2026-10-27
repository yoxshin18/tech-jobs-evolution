/** Etichetta a riquadro (come i tag "Incubation" del riferimento). */
export default function Tag({ children, accent = false, className = '' }) {
  return (
    <span
      className={`inline-flex items-center border px-1.5 py-0.5 font-mono text-[10px] leading-none ${
        accent ? 'border-accent-cyan bg-accent-cyan text-ink-950' : 'border-line-strong bg-ink-950 text-fg-muted'
      } ${className}`}
    >
      {children}
    </span>
  );
}
