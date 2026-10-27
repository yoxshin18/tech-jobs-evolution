import { Fragment } from 'react';
import data from '../../data/market_data.json';
import { useLocaleData } from '../../hooks/useLocaleData.js';
import { fmtPct } from '../../lib/format.js';
import { C } from '../../lib/palette.js';
import Cite from '../paper/Cite.jsx';

const TICKS = [0, 25, 50, 75, 100];
const ROW_H = 26;
const MID = ROW_H / 2;

// Raggruppate per anno obiettivo; dentro ogni anno, dal valore più alto al più
// basso, così le righe comparabili stanno vicine.
const GROUPS = Object.entries(
  data.gartner.reduce((acc, r) => {
    (acc[r.target_year] ??= []).push(r);
    return acc;
  }, {}),
)
  .map(([year, rows]) => ({ year: Number(year), rows: [...rows].sort((a, b) => b.value_pct - a.value_pct) }))
  .sort((a, b) => a.year - b.year);

/** Griglia verticale della scala, ripetuta dietro ogni traccia. */
function Gridlines() {
  return TICKS.map((v) => (
    <line key={v} x1={`${v}%`} x2={`${v}%`} y1="0" y2={ROW_H} stroke={C.line} strokeWidth="1" />
  ));
}

function Track({ row, hasBaseline }) {
  const lo = hasBaseline ? Math.min(row.baseline_pct, row.value_pct) : row.value_pct;
  const hi = hasBaseline ? Math.max(row.baseline_pct, row.value_pct) : row.value_pct;
  return (
    <svg width="100%" height={ROW_H} className="overflow-visible">
      <Gridlines />
      <line x1="0%" x2="100%" y1={MID} y2={MID} stroke={C.line} strokeWidth="1.5" />
      {hasBaseline && <line x1={`${lo}%`} x2={`${hi}%`} y1={MID} y2={MID} stroke={C.cyan} strokeWidth="2.5" />}
      {hasBaseline && (
        <circle cx={`${row.baseline_pct}%`} cy={MID} r="4.5" fill={C.ink} stroke={C.muted} strokeWidth="1.5" />
      )}
      <circle cx={`${row.value_pct}%`} cy={MID} r="5" fill={C.cyan} stroke={C.ink} strokeWidth="1" />
    </svg>
  );
}

/**
 * Fig. previsioni Gartner. Dumbbell orizzontale su una scala 0–100% condivisa.
 * Le coordinate sono percentuali SVG: estremi del segmento e centri dei punti
 * usano la stessa base, quindi l'allineamento è esatto per costruzione. La
 * versione precedente mescolava `left`/`width` in CSS con `translate(-50%)` e
 * animava la larghezza del segmento, che restava a zero se l'animazione non
 * scattava: da lì i punti scollegati dalle linee.
 */
export default function GartnerTimeline() {
  const { get, locale } = useLocaleData();
  const f = get('figures.gartner', {});

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 px-1 font-mono text-[10px] text-fg-muted">
        <span className="flex items-center gap-1.5">
          <svg width="12" height="12" aria-hidden="true">
            <circle cx="6" cy="6" r="4.5" fill={C.ink} stroke={C.muted} strokeWidth="1.5" />
          </svg>
          {f.baseline}
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="12" height="12" aria-hidden="true">
            <circle cx="6" cy="6" r="5" fill={C.cyan} />
          </svg>
          {f.target}
        </span>
        <span className="text-fg-faint">{f.noBaseline}</span>
      </div>

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-[minmax(0,1fr)_22rem_3rem]">
        {/* Intestazione della scala: stesse percentuali delle tracce, quindi
            ogni etichetta cade esattamente sopra la propria griglia. */}
        <span className="hidden sm:block" />
        <svg width="100%" height="14" className="overflow-visible" aria-hidden="true">
          {TICKS.map((v) => (
            <text
              key={v}
              x={`${v}%`}
              y="10"
              textAnchor={v === 0 ? 'start' : v === 100 ? 'end' : 'middle'}
              fill={C.faint}
              style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}
            >
              {fmtPct(v, locale)}
            </text>
          ))}
        </svg>
        <span className="hidden sm:block" />

        {GROUPS.flatMap(({ year, rows }) => [
          <div
            key={`y${year}`}
            className="col-span-full mt-3 border-t border-line pt-2 font-mono text-sm font-bold tracking-widest text-fg"
          >
            {year}
          </div>,
          ...rows.map((row) => {
            const hasBaseline = row.baseline_pct != null;
            const label = f.topics?.[row.id] ?? row.topic;
            const description = hasBaseline
              ? `${label}. ${f.baseline}: ${fmtPct(row.baseline_pct, locale)} (${row.baseline_year}). ${f.target}: ${fmtPct(row.value_pct, locale)} (${year}).`
              : `${label}. ${f.target}: ${fmtPct(row.value_pct, locale)} (${year}). ${f.noBaseline}.`;
            return (
              <Fragment key={row.id}>
                <p className="self-center pt-1.5 font-sans text-xs leading-snug text-fg-muted sm:py-1.5">
                  <span className="sr-only">{description}</span>
                  <span aria-hidden="true">
                    {label} <Cite ids={[row.source_id]} raw={`[${row.source_id}]`} />
                    {hasBaseline && (
                      <span className="ml-1 whitespace-nowrap font-mono text-[10px] text-fg-faint">
                        ({f.baseline} {fmtPct(row.baseline_pct, locale)} · {row.baseline_year})
                      </span>
                    )}
                  </span>
                </p>
                <div className="self-center py-1" aria-hidden="true">
                  <Track row={row} hasBaseline={hasBaseline} />
                </div>
                <p className="self-center pb-1.5 text-right font-mono text-xs tabular-nums text-fg sm:py-1.5" aria-hidden="true">
                  {fmtPct(row.value_pct, locale, 0)}
                </p>
              </Fragment>
            );
          }),
        ])}
      </div>
    </div>
  );
}
