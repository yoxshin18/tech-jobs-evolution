import { useState } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Label,
  Legend,
  Line,
  ReferenceArea,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import data from '../../data/market_data.json';
import { useLocaleData } from '../../hooks/useLocaleData.js';
import { fmtPct } from '../../lib/format.js';
import { C } from '../../lib/palette.js';
import ChartTooltip from './ChartTooltip.jsx';

const raw = data.adoption.series;
const LAST_OBSERVED = Math.max(...raw.filter((d) => d.observed).map((d) => d.year));
const LAST_YEAR = Math.max(...raw.map((d) => d.year));
// Il target Gartner è un singolo valore su un anno futuro: va mostrato come
// marcatore, non come serie, altrimenti si legge come una traiettoria.
const GARTNER_TARGET = raw
  .filter((d) => d.gartner_enterprise != null && d.year >= LAST_OBSERVED)
  .sort((a, b) => b.year - a.year)[0];
const FINAL = raw.find((d) => d.year === LAST_YEAR);
const OBSERVED_END = raw.find((d) => d.year === LAST_OBSERVED);
const PLANNED = raw.filter((d) => d.planning != null);
const PLANNING_LAST = PLANNED[PLANNED.length - 1];

// Ogni serie si distingue per colore *e* per forma (tratto o marcatore): il
// colore da solo escluderebbe chi ha un deficit di visione cromatica.
const DASH = { projection: '7 4', planning: '2 3', notUsing: '5 2 1 2' };

function SquareDot({ cx, cy, fill }) {
  if (cx == null || cy == null) return null;
  return <rect x={cx - 3.5} y={cy - 3.5} width={7} height={7} fill={fill} stroke={C.ink} strokeWidth={1.5} />;
}

function TriangleDot({ cx, cy, fill }) {
  if (cx == null || cy == null) return null;
  return (
    <path
      d={`M${cx},${cy - 4.5}L${cx + 4.3},${cy + 3.2}L${cx - 4.3},${cy + 3.2}Z`}
      fill={fill}
      stroke={C.ink}
      strokeWidth={1.5}
    />
  );
}

function DiamondDot({ cx, cy, fill }) {
  if (cx == null || cy == null) return null;
  return (
    <path
      d={`M${cx},${cy - 4.5}L${cx + 4.5},${cy}L${cx},${cy + 4.5}L${cx - 4.5},${cy}Z`}
      fill={fill}
      stroke={C.ink}
      strokeWidth={1.5}
    />
  );
}

/** Pulsante on/off indipendente, nello stile dei chip di filtro. */
function Toggle({ on, onClick, color, children }) {
  return (
    <button type="button" className="chip" aria-pressed={on} onClick={onClick}>
      <span
        className="h-2 w-2 shrink-0"
        style={{ background: on ? color : 'transparent', boxShadow: `inset 0 0 0 1px ${color}` }}
        aria-hidden="true"
      />
      {children}
    </button>
  );
}

/**
 * Fig. adozione. Una serie principale (quota di sviluppatori che usa l'AI),
 * osservata fino a LAST_OBSERVED e poi proiettata; la quota che pianificava
 * l'uso come serie secondaria; riferimenti esterni opzionali, su popolazioni
 * diverse, tenuti fuori dalla vista predefinita.
 */
export default function AdoptionAreaChart() {
  const { t, get, locale } = useLocaleData();
  const f = get('figures.adoption', {});
  const [showBand, setShowBand] = useState(true);
  const [showRefs, setShowRefs] = useState(false);

  // La proiezione parte dall'ultimo anno osservato, così non corre mai sopra i
  // dati misurati: nessuna sovrapposizione fra curva stimata e serie osservata.
  const series = raw.map((d) => {
    const projected = d.year >= LAST_OBSERVED;
    return {
      ...d,
      v_using: d.observed ? d.using : undefined,
      v_planning: d.planning ?? undefined,
      v_not: d.observed ? d.not_using : undefined,
      v_proj: projected ? d.proj_central : undefined,
      v_band: projected && showBand ? d.proj_band : undefined,
      v_org: showRefs ? d.org_any_ai ?? undefined : undefined,
    };
  });

  const params = data.adoption.derived.params.central;

  // Legenda esplicita: Recharts tiene comunque la banda fra le voci nonostante
  // legendType="none", e la banda ha già il proprio pulsante.
  const legendPayload = [
    { id: 'using', value: f.using, type: 'plainline', color: C.cyan, payload: { strokeWidth: 3 } },
    {
      id: 'proj',
      value: f.projection,
      type: 'plainline',
      color: C.indigo,
      payload: { strokeDasharray: DASH.projection, strokeWidth: 3 },
    },
    {
      id: 'planning',
      value: f.planning,
      type: 'square',
      color: C.amber,
      payload: { strokeDasharray: DASH.planning },
    },
    {
      id: 'notUsing',
      value: f.notUsing,
      type: 'triangle',
      color: C.fg,
      payload: { strokeDasharray: DASH.notUsing },
    },
    ...(showRefs ? [{ id: 'org', value: f.org, type: 'diamond', color: C.emerald }] : []),
  ];

  const annotation = (color) => ({
    fill: color,
    fontSize: 11,
    fontWeight: 600,
    fontFamily: 'JetBrains Mono, monospace',
  });

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-1">
        <div role="group" aria-label={f.toggleOrg} className="flex flex-wrap gap-1.5">
          <Toggle on={showBand} onClick={() => setShowBand((v) => !v)} color={C.indigo}>
            {f.band}
          </Toggle>
          <Toggle on={showRefs} onClick={() => setShowRefs((v) => !v)} color={C.emerald}>
            {f.toggleOrg}
          </Toggle>
        </div>
        <p className="font-mono text-[10px] text-fg-faint">
          {t('ui.derived')}: K={params.K} · r={params.r.toFixed(2)} · RMSE={params.rmse_pp} pp
        </p>
      </div>

      <div className="h-[380px] w-full sm:h-[440px]">
        <ResponsiveContainer>
          <ComposedChart data={series} margin={{ top: 24, right: 20, bottom: 4, left: 0 }}>
            <defs>
              <linearGradient id="gUsing" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.cyan} stopOpacity={0.26} />
                <stop offset="100%" stopColor={C.cyan} stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* Le due regioni sono etichettate in basso, dove il grafico è vuoto:
                sulla linea di confine verticale le etichette si sovrapporrebbero. */}
            <ReferenceArea x1={2023} x2={LAST_OBSERVED} fill="transparent">
              <Label
                value={t('ui.observed')}
                position="insideBottomLeft"
                style={{ fill: C.faint, fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
              />
            </ReferenceArea>
            <ReferenceArea x1={LAST_OBSERVED} x2={LAST_YEAR} fill={C.indigo} fillOpacity={0.035}>
              <Label
                value={t('ui.projection')}
                position="insideBottomRight"
                style={{ fill: C.faint, fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
              />
            </ReferenceArea>

            <CartesianGrid strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="year"
              type="number"
              domain={[2023, LAST_YEAR]}
              ticks={[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030]}
              tickLine={false}
              padding={{ left: 6, right: 6 }}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(v) => fmtPct(v, locale)}
              tickLine={false}
              axisLine={false}
              width={52}
            >
              <Label
                value={f.yAxis}
                angle={-90}
                position="insideLeft"
                style={{ fill: C.faint, fontSize: 11, textAnchor: 'middle' }}
              />
            </YAxis>

            {/* Confine osservato / proiettato. */}
            <ReferenceLine x={LAST_OBSERVED} stroke={C.lineStrong} strokeDasharray="3 3" />

            <Tooltip
              content={
                <ChartTooltip
                  formatter={(v) => fmtPct(v, locale, 1)}
                  rowsFrom={(d) =>
                    [
                      { key: 'u', name: f.using, value: d.observed ? d.using : null, color: C.cyan },
                      { key: 'p', name: f.planning, value: d.planning, color: C.amber },
                      { key: 'n', name: f.notUsing, value: d.observed ? d.not_using : null, color: C.fg },
                      {
                        key: 'c',
                        name: f.projection,
                        value: d.year >= LAST_OBSERVED ? d.proj_central : null,
                        color: C.indigo,
                      },
                      ...(showRefs ? [{ key: 'o', name: f.org, value: d.org_any_ai, color: C.emerald }] : []),
                    ].filter((r) => r.value != null)
                  }
                  labelFormatter={(y) => `${y} · ${y <= LAST_OBSERVED ? t('ui.observed') : t('ui.projection')}`}
                />
              }
            />
            <Legend verticalAlign="bottom" height={36} iconSize={14} payload={legendPayload} />

            {/* Banda degli scenari, solo sugli anni proiettati. */}
            {showBand && (
              <Area
                type="monotone"
                dataKey="v_band"
                name={f.band}
                stroke="none"
                fill={C.indigo}
                fillOpacity={0.3}
                legendType="none"
                isAnimationActive={false}
              />
            )}

            {/* Serie principale: osservata, tratto pieno e marcatori circolari.
                Il riempimento resta tenue per non coprire la serie secondaria. */}
            <Area
              type="monotone"
              dataKey="v_using"
              name={f.using}
              stroke={C.cyan}
              strokeWidth={2.5}
              fill="url(#gUsing)"
              dot={{ r: 3.5, fill: C.cyan, stroke: C.ink, strokeWidth: 1.5 }}
              activeDot={{ r: 5.5 }}
              animationDuration={900}
            />

            {/* Proiezione: prosegue la serie principale, tratteggio lungo. */}
            <Line
              type="monotone"
              dataKey="v_proj"
              name={f.projection}
              stroke={C.indigo}
              strokeWidth={2}
              strokeDasharray={DASH.projection}
              dot={false}
              animationDuration={1100}
            />

            {/* Serie secondaria: ambra, punteggiata, marcatori quadrati. */}
            <Line
              type="monotone"
              dataKey="v_planning"
              name={f.planning}
              stroke={C.amber}
              strokeWidth={1.75}
              strokeDasharray={DASH.planning}
              dot={<SquareDot fill={C.amber} />}
              activeDot={{ r: 5 }}
              animationDuration={900}
            />

            {/* "Non li usa": nel 2026 è il valore effettivamente rilevato, da cui
                è derivata la quota "usa"; non è quindi solo il complemento a 100. */}
            <Line
              type="monotone"
              dataKey="v_not"
              name={f.notUsing}
              stroke={C.fg}
              strokeWidth={1.5}
              strokeDasharray={DASH.notUsing}
              dot={<TriangleDot fill={C.fg} />}
              activeDot={{ r: 5 }}
              animationDuration={900}
            />

            {/* Riferimenti esterni, su richiesta: popolazioni diverse. */}
            {showRefs && (
              <Line
                type="monotone"
                dataKey="v_org"
                name={f.org}
                stroke={C.emerald}
                strokeWidth={1.5}
                dot={<DiamondDot fill={C.emerald} />}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
            )}
            {showRefs && GARTNER_TARGET && (
              <ReferenceDot
                x={GARTNER_TARGET.year}
                y={GARTNER_TARGET.gartner_enterprise}
                r={5}
                fill={C.negative}
                stroke={C.ink}
                strokeWidth={2}
                ifOverflow="visible"
              >
                <Label
                  value={`${f.gartnerTarget} ${fmtPct(GARTNER_TARGET.gartner_enterprise, locale)} (${GARTNER_TARGET.year})`}
                  position="bottom"
                  offset={10}
                  style={{ fill: C.negative, fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
                />
              </ReferenceDot>
            )}

            {/* Valori chiave annotati, agli estremi di ciascuna serie. */}
            {OBSERVED_END && (
              <ReferenceDot
                x={OBSERVED_END.year}
                y={OBSERVED_END.using}
                r={0}
                ifOverflow="visible"
                label={{ value: fmtPct(OBSERVED_END.using, locale, 1), position: 'top', offset: 18, style: annotation(C.cyan) }}
              />
            )}
            {FINAL && (
              <ReferenceDot
                x={FINAL.year}
                y={FINAL.proj_central}
                r={3.5}
                fill={C.indigo}
                stroke={C.ink}
                strokeWidth={1.5}
                ifOverflow="visible"
                label={{ value: fmtPct(FINAL.proj_central, locale, 1), position: 'top', offset: 10, style: annotation(C.indigo) }}
              />
            )}
            {PLANNING_LAST && (
              <ReferenceDot
                x={PLANNING_LAST.year}
                y={PLANNING_LAST.planning}
                r={0}
                ifOverflow="visible"
                label={{ value: fmtPct(PLANNING_LAST.planning, locale, 1), position: 'bottom', offset: 12, style: annotation(C.amber) }}
              />
            )}
            {OBSERVED_END && (
              <ReferenceDot
                x={OBSERVED_END.year}
                y={OBSERVED_END.not_using}
                r={0}
                ifOverflow="visible"
                label={{ value: fmtPct(OBSERVED_END.not_using, locale, 1), position: 'right', offset: 10, style: annotation(C.fg) }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-2 px-1 font-sans text-[11px] text-fg-faint">{f.note}</p>
    </div>
  );
}
