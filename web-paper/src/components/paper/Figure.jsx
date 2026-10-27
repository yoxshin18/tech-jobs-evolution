import { useLocaleData } from '../../hooks/useLocaleData.js';
import { FIGURE_SOURCES } from '../../lib/palette.js';
import CornerBrackets from '../ui/CornerBrackets.jsx';
import Reveal from '../ui/Reveal.jsx';
import Tag from '../ui/Tag.jsx';
import Cite from './Cite.jsx';

/** Cornice editoriale di figura: numero, titolo, grafico, didascalia e fonti. */
export default function Figure({ id, number, children, derived = false }) {
  const { t, get } = useLocaleData();
  const fig = get(`figures.${id}`, {});
  const sources = FIGURE_SOURCES[id] ?? [];

  return (
    <Reveal as="figure" id={`fig-${id}`} className="relative my-12">
      <div className="card relative">
        <CornerBrackets color="border-accent-cyan/70" />
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <Tag accent>
              {t('ui.figure')} {number}
            </Tag>
            {derived && <Tag>{t('ui.derived')}</Tag>}
          </div>
          <p className="font-mono text-[10px] text-fg-faint">
            {t('ui.sources')}:{' '}
            {sources.map((s) => (
              <Cite key={s} ids={[s]} raw={`[${s}]`} />
            ))}
          </p>
        </div>
        <div className="px-3 pb-4 pt-5 sm:px-5">
          <h4 className="mb-4 px-1 font-sans text-base font-semibold leading-snug text-fg sm:text-lg">{fig.title}</h4>
          {children}
        </div>
      </div>
      <figcaption className="mt-3 max-w-prose font-sans text-xs leading-relaxed text-fg-muted">
        <span className="font-mono text-fg">
          {t('ui.figure')} {number}.
        </span>{' '}
        {fig.caption}
      </figcaption>
    </Reveal>
  );
}
