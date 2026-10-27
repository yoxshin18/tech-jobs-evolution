import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocaleData } from '../../hooks/useLocaleData.js';

/** Citazione inline [n] con anteprima del riferimento al passaggio del mouse / focus. */
export default function Cite({ ids, raw }) {
  const { get } = useLocaleData();
  const refs = get('references', []);
  const [open, setOpen] = useState(false);
  const tipId = useId();
  const items = ids.map((id) => refs.find((r) => r.id === id)).filter(Boolean);

  const jump = (event) => {
    event.preventDefault();
    const el = document.getElementById(`ref-${ids[0]}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-1', 'ring-accent-cyan');
      window.setTimeout(() => el.classList.remove('ring-1', 'ring-accent-cyan'), 1600);
    }
  };

  return (
    <span className="relative inline-block" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <a
        href={`#ref-${ids[0]}`}
        onClick={jump}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        aria-describedby={open ? tipId : undefined}
        className="mx-0.5 align-baseline font-mono text-[0.72em] font-medium text-accent-cyan transition-colors hover:text-fg"
      >
        {raw}
      </a>
      <AnimatePresence>
        {open && items.length > 0 && (
          <motion.span
            id={tipId}
            role="tooltip"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.16 }}
            className="absolute bottom-full left-1/2 z-40 mb-2 block w-72 -translate-x-1/2 border border-line-strong bg-ink-900 p-3 text-left shadow-glow"
          >
            {items.map((ref) => (
              <span key={ref.id} className="mb-2 block last:mb-0">
                <span className="block font-mono text-[10px] uppercase tracking-widest text-accent-cyan">
                  [{ref.id}] {ref.authors} · {ref.year}
                </span>
                <span className="mt-0.5 block font-sans text-xs leading-snug text-fg">{ref.title}</span>
              </span>
            ))}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
