import { motion } from 'framer-motion';
import data from '../../data/market_data.json';
import { useLocaleData } from '../../hooks/useLocaleData.js';
import { fmtNumber, fmtPct } from '../../lib/format.js';
import { ROLE_COLORS } from '../../lib/palette.js';

/** Barre orizzontali animate in HTML per l'indice di penetrazione AI (stima). */
export default function ExposureBars() {
  const { get, locale } = useLocaleData();
  const f = get('figures.exposure', {});
  const labels = get('roles.labels', {});
  const rows = data.exposure.roles;
  const tasks = data.exposure.tasks;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_16rem]">
      <ul className="space-y-3">
        {rows.map((r, i) => (
          <li key={r.role} className="grid grid-cols-[9.5rem_1fr_3rem] items-center gap-3 sm:grid-cols-[12rem_1fr_3rem]">
            <span className="truncate font-sans text-xs text-fg">{labels[r.role] ?? r.label}</span>
            <span className="relative h-5 bg-surface-sunken" title={`${f.topTasks}: ${r.top_tasks.map((k) => f.tasks?.[k] ?? k).join(', ')}`}>
              <motion.span
                className="absolute inset-y-0 left-0"
                style={{ background: ROLE_COLORS[r.role] }}
                initial={{ width: 0 }}
                whileInView={{ width: `${r.index}%` }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              />
              {[25, 50, 75].map((g) => (
                <span key={g} className="absolute inset-y-0 w-px bg-ink-950/60" style={{ left: `${g}%` }} aria-hidden="true" />
              ))}
            </span>
            <span className="text-right font-mono text-xs text-fg">{fmtNumber(r.index, locale, 1)}</span>
          </li>
        ))}
      </ul>
      <div className="border-t border-line pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
        <p className="label-mono mb-3">Input · SO 2026</p>
        <ul className="space-y-1.5">
          {tasks.map((task) => (
            <li key={task.task} className="flex justify-between gap-2 font-mono text-[11px]">
              <span className="text-fg-muted">{f.tasks?.[task.task] ?? task.task}</span>
              <span className="text-fg">{fmtPct(task.share * 100, locale, 1)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
