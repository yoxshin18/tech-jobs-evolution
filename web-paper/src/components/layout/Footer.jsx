import { ArrowUp, Database, FileText } from 'lucide-react';
import { useLocaleData } from '../../hooks/useLocaleData.js';
import data from '../../data/market_data.json';
import CrossMark from '../ui/CrossMark.jsx';
import IsoGlyph from '../ui/IsoGlyph.jsx';

/** Fascia finale CTA, ispirata al blocco "Ready to discuss your project?" del riferimento. */
export default function Footer() {
  const { t, get, locale } = useLocaleData();
  const meta = get('meta', {});
  const footer = get('footer', {});

  const downloadDataset = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'market_data.json';
    a.click();
    // Revoca differita: Safari e Firefox avviano il download in modo asincrono.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  // Data fissa dei dati (YYYY-MM-DD): letta come data locale per non slittare di un giorno.
  const [y, m, d] = data.meta.data_cutoff.split('-').map(Number);
  const dataCutoff = new Date(y, m - 1, d).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <footer className="border-t border-line bg-ink-950">
      <div className="mx-auto max-w-page px-4 sm:px-6">
        <div className="relative grid border-x border-line md:grid-cols-3">
          <CrossMark className="absolute -left-px -top-px" />
          <div className="flex flex-col justify-center gap-2 p-8 md:p-10">
            <p className="flex items-center gap-2 font-mono text-sm uppercase tracking-wider text-fg">
              <span className="text-accent-cyan">▸</span> {footer.ctaKicker}
            </p>
            <p className="w-fit bg-fg px-1.5 py-0.5 font-mono text-sm uppercase tracking-wider text-ink-950">
              {footer.ctaHighlight}
            </p>
          </div>
          <div className="hidden items-center justify-center border-x border-line md:flex">
            <IsoGlyph className="h-24 w-24 opacity-70" />
          </div>
          <div className="flex flex-col justify-center gap-3 p-8 md:p-10">
            <button
              type="button"
              onClick={downloadDataset}
              className="chamfer inline-flex items-center justify-center gap-2 bg-accent-cyan px-5 py-3 font-mono text-2xs font-bold uppercase tracking-wider text-ink-950 transition-colors hover:bg-fg"
            >
              <Database className="h-3.5 w-3.5" aria-hidden="true" /> {footer.ctaPrimary}
            </button>
            <a
              href="#abstract-method"
              className="chamfer inline-flex items-center justify-center gap-2 border border-accent-cyan/60 px-5 py-3 font-mono text-2xs uppercase tracking-wider text-fg transition-colors hover:border-fg"
            >
              <FileText className="h-3.5 w-3.5" aria-hidden="true" /> {footer.ctaSecondary}
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-3 border-x border-t border-line px-6 py-6 text-2xs text-fg-muted sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono">
            {meta.title} · {meta.version} · {meta.date} · {footer.license}
          </p>
          <p className="font-mono">
            {t('ui.generatedAt')} {dataCutoff} · {footer.built}
          </p>
          <a href="#top" className="inline-flex items-center gap-1 font-mono hover:text-fg">
            <ArrowUp className="h-3 w-3" aria-hidden="true" /> {t('ui.backToTop')}
          </a>
        </div>
      </div>
    </footer>
  );
}
