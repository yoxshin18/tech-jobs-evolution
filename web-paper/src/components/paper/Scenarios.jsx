import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocaleData } from '../../hooks/useLocaleData.js';
import { C } from '../../lib/palette.js';
import RichText from './RichText.jsx';

const ACCENT = { base: C.cyan, accelerated: C.indigo, friction: C.amber };

/** Selettore di scenario a schede con transizione del contenuto. */
export default function Scenarios() {
  const { get } = useLocaleData();
  const items = get('scenarios', []);
  const [active, setActive] = useState(items[0]?.id);
  const current = items.find((s) => s.id === active) ?? items[0];
  if (!current) return null;

  return (
    <div className="my-10 border border-line">
      <div role="tablist" aria-label="Scenari" className="grid grid-cols-3 border-b border-line">
        {items.map((s) => {
          const on = s.id === active;
          return (
            <button
              key={s.id}
              role="tab"
              type="button"
              aria-selected={on}
              aria-controls={`scenario-${s.id}`}
              onClick={() => setActive(s.id)}
              className={`relative border-r border-line px-3 py-3 text-left transition-colors last:border-r-0 ${
                on ? 'bg-surface' : 'hover:bg-surface/50'
              }`}
            >
              {on && (
                <motion.span layoutId="scenario-bar" className="absolute inset-x-0 top-0 h-[2px]" style={{ background: ACCENT[s.id] }} />
              )}
              <span className="block font-mono text-[10px] uppercase tracking-widest text-fg-muted">{s.tag}</span>
              <span className="mt-0.5 block font-sans text-sm font-semibold text-fg">{s.name}</span>
            </button>
          );
        })}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          id={`scenario-${current.id}`}
          role="tabpanel"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="grid gap-6 bg-surface/60 p-5 sm:grid-cols-[1fr_14rem]"
        >
          <div>
            <p className="font-mono text-2xl" style={{ color: ACCENT[current.id] }}>
              {current.adoption}
            </p>
            <p className="mt-3 font-serif text-[1.02rem] leading-relaxed text-fg/90">{current.text}</p>
          </div>
          <ul className="space-y-2 border-t border-line pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
            {current.indicators.map((ind) => (
              <li key={ind} className="flex gap-2 font-mono text-[11px] leading-snug text-fg-muted">
                <span style={{ color: ACCENT[current.id] }}>▪</span>
                <span>
                  <RichText text={ind} />
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
