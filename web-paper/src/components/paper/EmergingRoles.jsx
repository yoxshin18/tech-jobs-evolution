import { motion } from 'framer-motion';
import { useLocaleData } from '../../hooks/useLocaleData.js';
import Tag from '../ui/Tag.jsx';
import RichText from './RichText.jsx';

const pad = (n) => String(n).padStart(2, '0');

export default function EmergingRoles() {
  const { get } = useLocaleData();
  const items = get('emerging', []);
  return (
    <div className="my-10 grid border-l border-t border-line sm:grid-cols-2">
      {items.map((item, i) => (
        <motion.article
          key={item.id}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ delay: (i % 2) * 0.08, duration: 0.5 }}
          className="group relative flex flex-col border-b border-r border-line bg-surface/50 p-5 transition-colors hover:bg-surface"
        >
          <div className="mb-4 flex items-center justify-between">
            <Tag>{item.tag}</Tag>
            <span className="font-display text-2xl text-fg-faint transition-colors group-hover:text-accent-cyan">{pad(i + 1)}</span>
          </div>
          <h4 className="font-sans text-base font-semibold text-fg">{item.title}</h4>
          <p className="mt-2 font-sans text-sm leading-relaxed text-fg-muted">{item.text}</p>
          <p className="mt-4 border-t border-dashed border-line pt-3 font-mono text-[11px] leading-relaxed text-fg/80">
            <span className="mr-1 text-accent-emerald">↳</span>
            <RichText text={item.signal} />
          </p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {item.skills.map((s) => (
              <li key={s} className="border border-line px-2 py-0.5 font-mono text-[10px] text-fg-muted">
                {s}
              </li>
            ))}
          </ul>
        </motion.article>
      ))}
    </div>
  );
}
