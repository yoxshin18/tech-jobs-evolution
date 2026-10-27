import { motion } from 'framer-motion';
import CrossMark from '../ui/CrossMark.jsx';
import BlockRenderer from './BlockRenderer.jsx';

/**
 * Sezione del paper: banda d'intestazione (numero a pixel + titolo) e corpo
 * con rail sinistro (indice locale) + colonna testo + note a margine.
 */
export default function Section({ section, figureNumbers, activeSub }) {
  const subs = section.blocks.filter((b) => b.type === 'h3');
  return (
    <section id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-16">
      <div className="mx-auto max-w-page px-4 sm:px-6">
        <div className="relative grid border-x border-b border-line lg:grid-cols-4">
          <CrossMark className="absolute -left-3 -top-3 hidden lg:block" />
          <div className="flex items-end border-b border-line p-6 lg:border-b-0 lg:border-r">
            <motion.p
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="font-display text-7xl leading-none text-fg sm:text-8xl"
              aria-hidden="true"
            >
              {section.number}
            </motion.p>
          </div>
          <div className="p-6 lg:col-span-3 lg:p-8">
            <p className="label-mono mb-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-accent-cyan" aria-hidden="true" />
              {section.kicker}
            </p>
            <motion.h2
              id={`${section.id}-title`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="max-w-3xl font-sans text-3xl font-semibold leading-tight tracking-tight text-fg sm:text-4xl"
            >
              {section.title}
            </motion.h2>
          </div>
        </div>

        <div className="grid border-x border-b border-line lg:grid-cols-4">
          <nav aria-label={section.kicker} className="hidden border-r border-line lg:block">
            {subs.length > 0 && (
              <ol className="sticky top-24 space-y-1 p-6">
                {subs.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className={`block border-l py-1 pl-3 font-mono text-[11px] leading-snug transition-colors ${
                        activeSub === s.id ? 'border-accent-cyan text-fg' : 'border-line text-fg-muted hover:text-fg'
                      }`}
                    >
                      {s.text}
                    </a>
                  </li>
                ))}
              </ol>
            )}
          </nav>
          <div className="min-w-0 bg-ink-950 px-4 py-10 sm:px-8 lg:col-span-3 lg:py-14">
            <div className="grid grid-cols-1 gap-x-10 lg:grid-cols-[minmax(0,1fr)_15rem]">
              {section.blocks.map((block, i) => (
                <BlockRenderer key={`${section.id}-${i}`} block={block} figureNumbers={figureNumbers} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
