/**
 * Tooltip custom per Recharts in dark mode.
 * `formatter(value, entry)` -> stringa; `labelFormatter(label)` -> stringa.
 */
export default function ChartTooltip({ active, payload, label, formatter, labelFormatter, footer, rowsFrom }) {
  if (!active || !payload?.length) return null;
  // `rowsFrom(datum)` permette di costruire righe dal dato originale (utile per aree a intervallo).
  const rows = rowsFrom
    ? rowsFrom(payload[0].payload)
    : payload.filter((p) => p.value != null && !Array.isArray(p.value) && p.type !== 'none');
  if (!rows.length) return null;
  return (
    <div className="min-w-[12rem] border border-line-strong bg-ink-900/95 px-3 py-2.5 shadow-glow backdrop-blur">
      <p className="mb-1.5 border-b border-line pb-1.5 font-mono text-[11px] uppercase tracking-widest text-fg">
        {labelFormatter ? labelFormatter(label, payload) : label}
      </p>
      <ul className="space-y-1">
        {rows.map((p) => (
          <li key={p.dataKey ?? p.name ?? p.key} className="flex items-center justify-between gap-4 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-fg-muted">
              <span className="h-2 w-2 shrink-0" style={{ background: p.color ?? p.stroke ?? p.fill }} aria-hidden="true" />
              {p.name}
            </span>
            <span className="text-fg">{formatter ? formatter(p.value, p) : p.value}</span>
          </li>
        ))}
      </ul>
      {footer && <p className="mt-2 border-t border-line pt-1.5 font-sans text-[10px] text-fg-faint">{footer}</p>}
    </div>
  );
}
