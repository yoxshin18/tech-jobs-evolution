import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Search } from 'lucide-react';
import data from '../../data/market_data.json';
import { useLocaleData } from '../../hooks/useLocaleData.js';
import { fmtNumber, fmtPct, fmtUsdK } from '../../lib/format.js';
import { ROLE_COLORS } from '../../lib/palette.js';
import Chips from '../ui/Chips.jsx';
import Tag from '../ui/Tag.jsx';

/**
 * Griglia di card per ruolo con filtri a chip e ricerca: è la trasposizione
 * diretta della griglia "portfolio" del riferimento (tag, nome, 2×2 metriche, freccia).
 */
export default function RoleCards() {
  const { t, get, locale } = useLocaleData();
  const [family, setFamily] = useState('all');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(null);
  const filters = get('roles.filters', {});
  const labels = get('roles.labels', {});
  const metrics = get('roles.metrics', {});

  const q = query.trim().toLowerCase();
  const roles = data.roles.table.filter((r) => {
    const label = (labels[r.role] ?? r.label).toLowerCase();
    const skills = (get(`roles.details.${r.role}.skills`, []) || []).join(' ').toLowerCase();
    return (family === 'all' || r.family === family) && (!q || label.includes(q) || skills.includes(q));
  });

  return (
    <div className="my-10">
      <div className="mb-5 flex flex-col gap-3 border-y border-line py-3 sm:flex-row sm:items-center sm:justify-between">
        <Chips
          label={t('ui.filterRoles')}
          value={family}
          onChange={setFamily}
          options={['all', 'core', 'ai', 'data'].map((k) => ({ key: k, label: filters[k] }))}
        />
        <label className="flex items-center gap-2 border border-line bg-surface-sunken px-3 py-1.5 sm:w-64">
          <Search className="h-3.5 w-3.5 text-fg-faint" aria-hidden="true" />
          <span className="sr-only">{t('ui.search')}</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('ui.search')}
            className="w-full bg-transparent font-mono text-2xs text-fg placeholder:text-fg-faint focus:outline-none"
          />
        </label>
      </div>

      <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {roles.map((r) => {
            const isOpen = expanded === r.role;
            const details = get(`roles.details.${r.role}`, {});
            return (
              <motion.article
                layout
                key={r.role}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
                className="card group flex flex-col"
              >
                <div className="flex">
                  <Tag>{get(`roles.families.${r.family}`, r.family)}</Tag>
                </div>
                <div className="flex min-h-[7.5rem] flex-col items-center justify-center gap-2 px-5 py-6 text-center">
                  <span className="h-1 w-8" style={{ background: ROLE_COLORS[r.role] }} aria-hidden="true" />
                  <h4 className="font-sans text-lg font-semibold leading-tight text-fg">{labels[r.role] ?? r.label}</h4>
                  <p className="font-mono text-[10px] text-fg-faint">
                    BLS: {r.bls_occupation}
                    {r.bls_is_proxy && ` (${t('ui.proxy')})`}
                  </p>
                </div>
                <div className="grid grid-cols-[1fr_1fr_auto] border-t border-line">
                  <div className="grid grid-cols-2 col-span-2">
                    {[
                      [fmtUsdK(r.bls_median_pay, locale), metrics.usPay],
                      [fmtPct(r.bls_growth_2025_35, locale, 0, true), metrics.blsGrowth],
                      [fmtPct(r.wef_growth_2025_30, locale, 0, true), metrics.wefGrowth],
                      [fmtNumber(r.ai_task_index, locale, 1), metrics.aiIndex],
                    ].map(([value, label], i) => (
                      <div key={label} className={`border-line p-3 ${i % 2 === 0 ? 'border-r' : ''} ${i < 2 ? 'border-b' : ''}`}>
                        <p className="font-mono text-sm text-fg">{value}</p>
                        <p className="mt-0.5 font-mono text-[10px] text-fg-muted">{label}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : r.role)}
                    aria-expanded={isOpen}
                    aria-label={labels[r.role]}
                    className="flex w-14 items-center justify-center border-l border-line text-fg transition-colors hover:bg-accent-cyan hover:text-ink-950"
                  >
                    <ArrowRight className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                  </button>
                </div>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-line bg-surface-sunken"
                    >
                      <div className="space-y-3 p-4">
                        <p className="font-sans text-xs leading-relaxed text-fg-muted">{details.summary}</p>
                        <ul className="flex flex-wrap gap-1.5">
                          {(details.skills ?? []).map((s) => (
                            <li key={s} className="border border-line px-2 py-0.5 font-mono text-[10px] text-fg">
                              {s}
                            </li>
                          ))}
                        </ul>
                        <p className="font-mono text-[10px] text-fg-faint">
                          SO 2025: {r.so_dev_type} · {fmtUsdK(r.so_median_usd, locale)}
                          {r.so_change_vs_2024 != null && ` (${fmtPct(r.so_change_vs_2024, locale, 1, true)} vs 2024)`}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
