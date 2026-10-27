import { useState } from 'react';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';
import data from '../../data/market_data.json';
import { useLocaleData } from '../../hooks/useLocaleData.js';
import { fmtNumber } from '../../lib/format.js';
import { ROLE_COLORS } from '../../lib/palette.js';
import Chips from '../ui/Chips.jsx';
import ChartTooltip from './ChartTooltip.jsx';

/** Radar SWE vs AI/ML vs Data: cinque assi normalizzati, ruoli selezionabili. */
export default function RoleRadarChart() {
  const { get, locale } = useLocaleData();
  const f = get('figures.radar', {});
  const labels = get('roles.labels', {});
  const roles = data.roles.radar_roles;
  const [selected, setSelected] = useState(['swe', 'ai_ml', 'data_scientist']);
  const rows = data.roles.radar.map((r) => ({ ...r, axisLabel: f.axes?.[r.axis] ?? r.axis }));

  return (
    <div>
      <Chips
        multiple
        className="mb-2 px-1"
        label={f.title}
        value={selected}
        onChange={setSelected}
        options={roles.map((r) => ({ key: r, label: labels[r] ?? r, color: ROLE_COLORS[r] }))}
      />
      <div className="h-[380px] w-full sm:h-[440px]">
        <ResponsiveContainer>
          <RadarChart data={rows} outerRadius="72%" margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
            <PolarGrid gridType="polygon" />
            <PolarAngleAxis dataKey="axisLabel" tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
            <Tooltip content={<ChartTooltip formatter={(v) => `${fmtNumber(v, locale, 1)} / 100`} />} />
            {roles
              .filter((r) => selected.includes(r))
              .map((r) => (
                <Radar
                  key={r}
                  name={labels[r] ?? r}
                  dataKey={r}
                  stroke={ROLE_COLORS[r]}
                  fill={ROLE_COLORS[r]}
                  fillOpacity={0.12}
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: ROLE_COLORS[r] }}
                  animationDuration={900}
                />
              ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
