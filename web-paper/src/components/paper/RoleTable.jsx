import data from '../../data/market_data.json';
import { useLocaleData } from '../../hooks/useLocaleData.js';
import { fmtNumber, fmtPct, fmtUsd } from '../../lib/format.js';
import { ROLE_COLORS } from '../../lib/palette.js';
import Reveal from '../ui/Reveal.jsx';
import Tag from '../ui/Tag.jsx';

function Bar({ value, max, color }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <span className="mt-1 block h-1 w-full bg-line" aria-hidden="true">
      <span className="block h-full" style={{ width: `${pct}%`, background: color }} />
    </span>
  );
}

export default function RoleTable() {
  const { t, get, locale } = useLocaleData();
  const tt = get('roles.table', {});
  const labels = get('roles.labels', {});
  const rows = data.roles.table;
  const maxIdx = Math.max(...rows.map((r) => r.ai_task_index));

  return (
    <Reveal className="my-10">
      <div className="mb-3 flex items-center gap-2">
        <Tag accent>{t('ui.table')} 1</Tag>
        <p className="font-sans text-sm font-semibold text-fg">{tt.title}</p>
      </div>
      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[46rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-line bg-surface">
              {[tt.role, tt.demand, tt.pay, tt.automation, tt.skills].map((h) => (
                <th key={h} scope="col" className="label-mono px-3 py-2.5 font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const skills = get(`roles.details.${r.role}.skills`, []) || [];
              return (
                <tr key={r.role} className="border-b border-line align-top transition-colors last:border-b-0 hover:bg-surface/60">
                  <th scope="row" className="px-3 py-3 font-normal">
                    <span className="flex items-center gap-2 font-sans text-sm font-medium text-fg">
                      <span className="h-2 w-2 shrink-0" style={{ background: ROLE_COLORS[r.role] }} aria-hidden="true" />
                      {labels[r.role]}
                    </span>
                    <span className="mt-0.5 block font-mono text-[10px] text-fg-faint">
                      {r.bls_occupation}
                      {r.bls_is_proxy && ' †'}
                    </span>
                  </th>
                  <td className="whitespace-nowrap px-3 py-3 font-mono text-xs text-fg">
                    BLS {fmtPct(r.bls_growth_2025_35, locale, 0, true)}
                    <span className="block text-fg-muted">WEF {fmtPct(r.wef_growth_2025_30, locale, 0, true)}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-mono text-xs text-fg">
                    {fmtUsd(r.bls_median_pay, locale)}
                    <span className="block text-fg-muted">SO {fmtUsd(r.so_median_usd, locale)}</span>
                  </td>
                  <td className="w-32 px-3 py-3 font-mono text-xs text-fg">
                    {fmtNumber(r.ai_task_index, locale, 1)}
                    <Bar value={r.ai_task_index} max={maxIdx} color={ROLE_COLORS[r.role]} />
                  </td>
                  <td className="px-3 py-3 font-sans text-xs text-fg-muted">{skills.slice(0, 4).join(' · ')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 font-sans text-xs text-fg-muted">{tt.caption}</p>
    </Reveal>
  );
}
