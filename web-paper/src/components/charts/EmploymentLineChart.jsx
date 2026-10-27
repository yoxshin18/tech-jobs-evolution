import { useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  LabelList,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import data from '../../data/market_data.json';
import { useLocaleData } from '../../hooks/useLocaleData.js';
import { fmtNumber, fmtPct, fmtUsd, fmtUsdK } from '../../lib/format.js';
import { C, OCCUPATION_COLORS } from '../../lib/palette.js';
import { niceAxis } from '../../lib/scale.js';
import Chips from '../ui/Chips.jsx';
import ChartTooltip from './ChartTooltip.jsx';

const DEFAULT_LINES = ['data_scientists', 'research_scientists', 'software_developers', 'web_developers', 'computer_programmers'];

// Assi calcolati su tutte le serie (anche quelle nascoste), così la scala non
// cambia quando si accendono o spengono le linee.
const TRAJ_AXIS = niceAxis(
  data.employment.trajectories.flatMap((d) => Object.keys(OCCUPATION_COLORS).map((k) => d[k])),
  { include: [100] },
);
const WAGE_AXIS = niceAxis(
  data.employment.swe_wages.series.flatMap((d) => [d.median_wage, d.trend_linear, d.trend_recent_cagr]),
);

function Trajectories({ f, locale }) {
  const keys = Object.keys(OCCUPATION_COLORS);
  const [visible, setVisible] = useState(DEFAULT_LINES);
  const cagr = Object.fromEntries(data.employment.cagr.map((c) => [c.key, c]));
  return (
    <>
      <Chips
        multiple
        className="mb-4 px-1"
        label={f.index}
        value={visible}
        onChange={setVisible}
        options={keys.map((k) => ({ key: k, label: f.occupations?.[k] ?? k, color: OCCUPATION_COLORS[k] }))}
      />
      <div className="h-[340px] w-full sm:h-[380px]">
        <ResponsiveContainer>
          <LineChart data={data.employment.trajectories} margin={{ top: 10, right: 24, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey="year" tickLine={false} />
            <YAxis domain={TRAJ_AXIS.domain} ticks={TRAJ_AXIS.ticks} tickLine={false} axisLine={false} width={52}>
              <Label
                value={f.index}
                angle={-90}
                position="insideLeft"
                style={{ fill: C.faint, fontSize: 11, textAnchor: 'middle' }}
              />
            </YAxis>
            <ReferenceLine y={100} stroke={C.lineStrong} strokeDasharray="4 4" />
            <Tooltip
              content={
                <ChartTooltip
                  formatter={(v, p) => `${fmtNumber(v, locale, 1)} · ${fmtPct(cagr[p.dataKey]?.cagr_pct, locale, 2, true)}/a`}
                  labelFormatter={(y) => `${y} · ${f.index}`}
                />
              }
            />
            {keys
              .filter((k) => visible.includes(k))
              .map((k) => (
                <Line
                  key={k}
                  type="monotone"
                  dataKey={k}
                  name={f.occupations?.[k] ?? k}
                  stroke={OCCUPATION_COLORS[k]}
                  strokeWidth={k === 'software_developers' ? 2.5 : 1.75}
                  dot={false}
                  activeDot={{ r: 4 }}
                  animationDuration={1100}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

function Revisions({ f, locale }) {
  const rows = data.employment.swe_revisions;
  return (
    <div className="h-[340px] w-full sm:h-[380px]">
      <ResponsiveContainer>
        <BarChart data={rows} margin={{ top: 24, right: 16, bottom: 0, left: -8 }}>
          <CartesianGrid strokeDasharray="2 4" vertical={false} />
          <XAxis dataKey="cycle" tickLine={false} />
          <YAxis domain={[0, 30]} ticks={[0, 10, 20, 30]} tickFormatter={(v) => fmtPct(v, locale)} tickLine={false} axisLine={false} width={44} />
          <Tooltip
            cursor={{ fill: 'rgba(56,189,248,0.06)' }}
            content={<ChartTooltip formatter={(v) => fmtPct(v, locale, 0, true)} labelFormatter={(c) => `BLS ${c}`} />}
          />
          <Bar dataKey="growth_pct" name={f.growth} radius={0} animationDuration={1000}>
            {rows.map((r, i) => (
              <Cell key={r.cycle} fill={i === rows.length - 1 ? C.cyan : C.lineStrong} />
            ))}
            <LabelList dataKey="growth_pct" position="top" formatter={(v) => fmtPct(v, locale)} className="fill-fg font-mono text-xs" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function Wages({ f, locale }) {
  const { series, derived } = data.employment.swe_wages;
  return (
    <>
      <p className="mb-3 px-1 font-mono text-[10px] text-fg-faint">
        CAGR 2021–25: {fmtPct(derived.cagr_2021_2025_pct, locale, 1)} · CAGR 2023–25: {fmtPct(derived.cagr_2023_2025_pct, locale, 1)}
      </p>
      <div className="h-[320px] w-full sm:h-[360px]">
        <ResponsiveContainer>
          <LineChart data={series} margin={{ top: 10, right: 24, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey="year" tickLine={false} />
            <YAxis
              domain={WAGE_AXIS.domain}
              ticks={WAGE_AXIS.ticks}
              tickFormatter={(v) => fmtUsdK(v, locale)}
              tickLine={false}
              axisLine={false}
              width={52}
            />
            <ReferenceLine x={2025} stroke={C.lineStrong} strokeDasharray="4 4" label={{ value: '2025', position: 'top', fill: C.faint, fontSize: 10 }} />
            <Tooltip content={<ChartTooltip formatter={(v) => fmtUsd(v, locale)} />} />
            <Line type="monotone" dataKey="trend_linear" name={f.trendLinear} stroke={C.indigo} strokeDasharray="5 5" strokeWidth={1.5} dot={false} animationDuration={900} />
            <Line type="monotone" dataKey="trend_recent_cagr" name={f.trendRecent} stroke={C.amber} strokeDasharray="2 4" strokeWidth={1.75} dot={false} connectNulls animationDuration={900} />
            <Line type="monotone" dataKey="median_wage" name={f.wage} stroke={C.cyan} strokeWidth={2.5} dot={{ r: 3.5, fill: C.cyan, stroke: C.ink }} activeDot={{ r: 5 }} connectNulls={false} animationDuration={1200} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

/** Figura con tre viste (tab) sul mercato del lavoro USA. */
export default function EmploymentLineChart() {
  const { get, locale } = useLocaleData();
  const f = get('figures.employment', {});
  const [tab, setTab] = useState('trajectories');
  const tabs = ['trajectories', 'revisions', 'wages'];
  const id = useId();
  const tabRefs = useRef({});
  const tabId = (k) => `${id}-tab-${k}`;
  const panelId = (k) => `${id}-panel-${k}`;

  // Pattern ARIA "tabs" con attivazione automatica: frecce sinistra/destra
  // (cicliche), Home ed End spostano il focus e selezionano il tab.
  const onKeyDown = (e) => {
    const i = tabs.indexOf(tab);
    const next = {
      ArrowRight: tabs[(i + 1) % tabs.length],
      ArrowLeft: tabs[(i - 1 + tabs.length) % tabs.length],
      Home: tabs[0],
      End: tabs[tabs.length - 1],
    }[e.key];
    if (!next) return;
    e.preventDefault();
    setTab(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label={f.title} className="mb-4 flex flex-wrap gap-1.5 px-1" onKeyDown={onKeyDown}>
        {tabs.map((k) => (
          <button
            key={k}
            ref={(el) => {
              tabRefs.current[k] = el;
            }}
            id={tabId(k)}
            type="button"
            role="tab"
            aria-selected={tab === k}
            aria-controls={panelId(k)}
            tabIndex={tab === k ? 0 : -1}
            className="chip"
            onClick={() => setTab(k)}
          >
            {f.tabs?.[k]}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          id={panelId(tab)}
          role="tabpanel"
          aria-labelledby={tabId(tab)}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28 }}
        >
          {tab === 'trajectories' && <Trajectories f={f} locale={locale} />}
          {tab === 'revisions' && <Revisions f={f} locale={locale} />}
          {tab === 'wages' && <Wages f={f} locale={locale} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
