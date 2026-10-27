import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import data from '../../data/market_data.json';
import { useLocaleData } from '../../hooks/useLocaleData.js';
import { fmtPct } from '../../lib/format.js';
import { C } from '../../lib/palette.js';
import { niceAxis } from '../../lib/scale.js';
import ChartTooltip from './ChartTooltip.jsx';

const AXIS = niceAxis(
  data.wef.fastest_growing.map((r) => r.growth_pct),
  { count: 4, include: [0] },
);

export default function WefBarChart() {
  const { get, locale } = useLocaleData();
  const f = get('figures.wef', {});
  const rows = data.wef.fastest_growing.map((r) => ({ ...r, label: f.jobs?.[r.job] ?? r.job }));
  return (
    <div className="h-[520px] w-full">
      <ResponsiveContainer>
        <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 48, bottom: 0, left: 8 }} barCategoryGap="22%">
          <CartesianGrid strokeDasharray="2 4" horizontal={false} />
          <XAxis type="number" domain={AXIS.domain} ticks={AXIS.ticks} tickFormatter={(v) => fmtPct(v, locale)} tickLine={false} />
          <YAxis type="category" dataKey="label" width={210} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} interval={0} />
          <Tooltip
            cursor={{ fill: 'rgba(56,189,248,0.06)' }}
            content={<ChartTooltip formatter={(v) => fmtPct(v, locale, 0, true)} />}
          />
          <Bar dataKey="growth_pct" name={f.growth} animationDuration={1100}>
            {rows.map((r) => (
              <Cell key={r.job} fill={r.tech ? C.cyan : C.lineStrong} />
            ))}
            <LabelList dataKey="growth_pct" position="right" formatter={(v) => fmtPct(v, locale, 0, true)} className="fill-fg font-mono text-[10px]" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
