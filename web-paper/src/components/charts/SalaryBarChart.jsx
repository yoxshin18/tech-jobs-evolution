import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import data from '../../data/market_data.json';
import { useLocaleData } from '../../hooks/useLocaleData.js';
import { fmtNumber, fmtUsd, fmtUsdK } from '../../lib/format.js';
import { C } from '../../lib/palette.js';
import ChartTooltip from './ChartTooltip.jsx';

/** Barre orizzontali raggruppate: salario mediano USA (BLS) vs globale (SO). */
export default function SalaryBarChart() {
  const { get, locale } = useLocaleData();
  const f = get('figures.salary', {});
  const labels = get('roles.labels', {});
  const rows = data.roles.salaries.map((r) => ({ ...r, name: labels[r.role] ?? r.label }));

  return (
    <div className="h-[460px] w-full">
      <ResponsiveContainer>
        <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 56, bottom: 0, left: 8 }} barGap={2} barCategoryGap="28%">
          <CartesianGrid strokeDasharray="2 4" horizontal={false} />
          <XAxis type="number" domain={[0, 160000]} tickFormatter={(v) => fmtUsdK(v, locale)} tickLine={false} />
          <YAxis type="category" dataKey="name" width={150} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
          <Tooltip
            cursor={{ fill: 'rgba(56,189,248,0.06)' }}
            content={
              <ChartTooltip
                formatter={(v) => fmtUsd(v, locale)}
                footer={undefined}
                labelFormatter={(l, p) => `${l} · ${f.ratio} ${fmtNumber(p?.[0]?.payload?.ratio, locale, 2)}×`}
              />
            }
          />
          <Legend verticalAlign="top" align="right" height={32} iconType="square" iconSize={9} />
          <Bar dataKey="us_bls" name={f.us} fill={C.cyan} animationDuration={1000} />
          <Bar dataKey="global_so" name={f.global} fill={C.indigo} fillOpacity={0.85} animationDuration={1200}>
            <LabelList dataKey="ratio" position="right" formatter={(v) => `${fmtNumber(v, locale, 2)}×`} className="fill-fg-muted font-mono text-[10px]" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
