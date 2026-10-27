import { motion } from 'framer-motion';
import Cite from './Cite.jsx';

/** Griglia di statistiche: valore grande in mono + etichetta, celle separate da filetti. */
export default function KpiGrid({ items = [] }) {
  return (
    <div className="my-10 grid grid-cols-2 border-l border-t border-line sm:grid-cols-4">
      {items.map((kpi, i) => (
        <motion.div
          key={kpi.label}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, duration: 0.5 }}
          className="border-b border-r border-line bg-surface/60 p-4"
        >
          <p className="font-mono text-xl text-fg">{kpi.value}</p>
          <p className="mt-1.5 font-mono text-[10px] leading-snug text-fg-muted">
            {kpi.label}
            {kpi.ref && <Cite ids={[kpi.ref]} raw={`[${kpi.ref}]`} />}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
