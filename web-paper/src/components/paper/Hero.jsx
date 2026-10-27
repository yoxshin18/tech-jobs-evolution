import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLocaleData } from '../../hooks/useLocaleData.js';
import CornerBrackets from '../ui/CornerBrackets.jsx';
import CrossMark from '../ui/CrossMark.jsx';
import IsoGlyph from '../ui/IsoGlyph.jsx';
import Tag from '../ui/Tag.jsx';
import RichText from './RichText.jsx';
import Cite from './Cite.jsx';

const pad = (n) => String(n).padStart(2, '0');

/**
 * Apertura del paper: titolo "mega" a pixel con underscore, colonna metadati,
 * contatori e card in evidenza con riga di statistiche (struttura del riferimento).
 */
export default function Hero({ figureCount }) {
  const { get } = useLocaleData();
  const reduce = useReducedMotion();
  const meta = get('meta', {});
  const hero = get('hero', {});
  const ui = get('ui', {});
  const refs = get('references', []);
  const sections = get('sections', []);
  const [lineA, lineB] = meta.titleDisplay ?? ['TECH_JOBS', 'EVOLUTION'];

  const letter = {
    hidden: { opacity: 0, y: reduce ? 0 : 40 },
    show: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.08 + i * 0.035, duration: 0.5, ease: [0.22, 1, 0.36, 1] } }),
  };

  const renderLine = (text, offset) =>
    text.split('').map((ch, i) => (
      <motion.span
        key={`${ch}-${i}`}
        custom={i + offset}
        variants={letter}
        initial="hidden"
        animate="show"
        className={ch === '_' ? 'mx-[0.04em] inline-block h-[0.11em] w-[0.62em] bg-accent-cyan align-baseline' : 'inline-block'}
      >
        {ch === '_' ? '' : ch}
      </motion.span>
    ));

  return (
    <section id="top" aria-labelledby="paper-title" className="relative">
      <div className="mx-auto max-w-page px-4 sm:px-6">
        <div className="relative border-x border-b border-line">
          <CrossMark className="absolute -left-3 top-[42%] hidden lg:block" />

          {/* Titolo */}
          <div className="overflow-hidden border-b border-line px-4 pb-6 pt-10 sm:px-8 sm:pt-14">
            <p className="label-mono mb-6 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-accent-cyan">■</span>
              {meta.kicker}
            </p>
            <h1 id="paper-title" className="font-display text-mega uppercase text-fg">
              <span className="sr-only">
                {meta.title} — {meta.subtitle}
              </span>
              <span aria-hidden="true" className="block whitespace-nowrap">
                {renderLine(lineA, 0)}
              </span>
              <span aria-hidden="true" className="block whitespace-nowrap">
                {renderLine(lineB, lineA.length)}
                <span className="ml-2 inline-block w-[0.45em] animate-blink bg-accent-cyan align-baseline">&nbsp;</span>
              </span>
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mt-6 max-w-3xl font-serif text-xl italic text-fg-muted sm:text-2xl"
            >
              {meta.subtitle}
            </motion.p>
          </div>

          {/* Riga metadati + card in evidenza */}
          <div className="grid lg:grid-cols-4">
            <div className="flex flex-col border-b border-line lg:col-span-1 lg:border-b-0 lg:border-r">
              <div className="flex-1 space-y-4 p-6">
                <p className="font-mono text-xs leading-relaxed text-fg">
                  <span className="mr-2 text-accent-cyan">■</span>
                  {meta.author}
                  <br />
                  <span className="text-fg-muted">{meta.affiliation}</span>
                </p>
                <dl className="space-y-1.5 font-mono text-2xs text-fg-muted">
                  <div className="flex justify-between gap-4"><dt>Status</dt><dd className="text-fg">{meta.status}</dd></div>
                  <div className="flex justify-between gap-4"><dt>Version</dt><dd className="text-fg">{meta.version}</dd></div>
                  <div className="flex justify-between gap-4"><dt>Date</dt><dd className="text-fg">{meta.date}</dd></div>
                  <div className="flex justify-between gap-4"><dt>Read</dt><dd className="text-fg">{meta.readingTime}</dd></div>
                </dl>
              </div>
              <div className="grid grid-cols-3 border-t border-line">
                {[
                  [ui.sectionsCount, sections.length],
                  [ui.sourcesCount, refs.length],
                  [ui.figuresCount, figureCount],
                ].map(([label, value]) => (
                  <div key={label} className="border-r border-line p-4 last:border-r-0">
                    <p className="font-mono text-[10px] leading-tight text-fg-muted">{label}</p>
                    <p className="mt-1 font-display text-4xl text-fg">{pad(value)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center border-b border-line p-8 lg:border-b-0 lg:border-r">
              <div className="relative p-6">
                <CornerBrackets />
                <IsoGlyph className="h-24 w-24" />
              </div>
            </div>

            <motion.article
              initial={{ opacity: 0, y: reduce ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="flex flex-col bg-surface lg:col-span-2"
            >
              <div className="flex gap-0">
                <Tag accent>{hero.featuredTagAccent}</Tag>
                <Tag>{hero.featuredTag}</Tag>
              </div>
              <div className="grid flex-1 gap-5 p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:p-8">
                <h2 className="font-sans text-2xl font-semibold leading-tight text-fg sm:max-w-[12ch]">
                  {hero.featuredTitle}
                </h2>
                <p className="font-mono text-xs leading-relaxed text-fg-muted">{hero.featuredText}</p>
              </div>
              <div className="grid grid-cols-2 border-t border-line sm:grid-cols-[repeat(4,1fr)_auto]">
                {(hero.stats ?? []).map((s) => (
                  <div key={s.label} className="border-b border-r border-line p-4 sm:border-b-0">
                    <p className="font-mono text-base text-fg">{s.value}</p>
                    <p className="mt-1 font-mono text-[10px] leading-tight text-fg-muted">
                      {s.label} <Cite ids={[s.ref]} raw={`[${s.ref}]`} />
                    </p>
                  </div>
                ))}
                <a
                  href="#abstract"
                  aria-label="Abstract"
                  className="group col-span-2 flex items-center justify-center border-line p-4 text-fg transition-colors hover:bg-accent-cyan hover:text-ink-950 sm:col-span-1"
                >
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>
            </motion.article>
          </div>
        </div>

        <div className="border-x border-b border-line px-4 py-10 sm:px-8">
          <p className="lead-prose max-w-4xl">
            <RichText text={hero.lead} />
          </p>
          <p className="label-mono mt-6">{meta.dataCutoff}</p>
        </div>
      </div>
    </section>
  );
}
