import { ExternalLink } from 'lucide-react';
import { useLocaleData } from '../../hooks/useLocaleData.js';
import Reveal from '../ui/Reveal.jsx';

const PUBLISHER_COLORS = {
  'Stack Overflow': 'bg-accent-amber',
  GitHub: 'bg-fg',
  'World Economic Forum': 'bg-accent-indigo',
  'U.S. Bureau of Labor Statistics': 'bg-accent-cyan',
  'Stanford Institute for Human-Centered AI': 'bg-accent-emerald',
  Gartner: 'bg-fg-muted',
};

export default function References() {
  const { t, get } = useLocaleData();
  const refs = get('references', []);
  return (
    <ol className="my-8 border-t border-line">
      {refs.map((ref, i) => (
        <Reveal
          as="li"
          key={ref.id}
          delay={Math.min(i * 0.02, 0.2)}
          id={`ref-${ref.id}`}
          className="grid grid-cols-[3rem_1fr] gap-x-3 border-b border-line py-4 transition-shadow"
        >
          <span className="font-mono text-xs text-accent-cyan">[{ref.id}]</span>
          <div>
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-fg-muted">
              <span className={`h-1.5 w-1.5 ${PUBLISHER_COLORS[ref.authors] ?? 'bg-fg-faint'}`} aria-hidden="true" />
              {ref.authors} · {ref.year}
            </p>
            <p className="mt-1 font-serif text-[0.98rem] leading-snug text-fg">{ref.title}</p>
            {ref.note && <p className="mt-1 font-sans text-xs text-fg-muted">{ref.note}</p>}
            <a
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-flex max-w-full items-center gap-1 break-all font-mono text-[10px] text-accent-cyan/80 hover:text-accent-cyan"
            >
              <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="sr-only">{t('ui.openSource')}: </span>
              {ref.url.replace(/^https?:\/\//, '')}
            </a>
          </div>
        </Reveal>
      ))}
    </ol>
  );
}
