import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useLocaleData } from '../../hooks/useLocaleData.js';
import PixelMark from '../ui/PixelMark.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';

function NavLink({ section, active, label, onClick }) {
  const isActive = active === section.id;
  return (
    <a
      href={`#${section.id}`}
      onClick={onClick}
      aria-current={isActive ? 'location' : undefined}
      className={`relative px-2.5 py-1.5 font-mono text-2xs transition-colors ${
        isActive ? 'text-fg' : 'text-fg-muted hover:text-fg'
      }`}
    >
      {isActive && (
        <motion.span layoutId="nav-brackets" className="absolute inset-0" transition={{ type: 'spring', stiffness: 380, damping: 32 }}>
          <span className="absolute left-0 top-0 h-2 w-2 border-l border-t border-accent-cyan" />
          <span className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-accent-cyan" />
        </motion.span>
      )}
      <span className="mr-1 text-fg-faint">{section.number}</span>
      {label}
    </a>
  );
}

/** Header a celle separate da filetti, con voce attiva tra angolari (come il riferimento). */
export default function Header({ sections, active }) {
  const { t, get } = useLocaleData();
  const [open, setOpen] = useState(false);
  const meta = get('meta', {});

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink-950/85 backdrop-blur-md">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-fg focus:px-3 focus:py-2 focus:text-ink-950">
        {t('ui.skipToContent')}
      </a>
      <div className="mx-auto flex h-16 max-w-page items-stretch px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5 border-r border-line pr-4 sm:pr-6">
          <PixelMark className="h-8 w-8 shrink-0" />
          <span className="leading-none">
            <span className="block font-sans text-[11px] text-fg-muted">{meta.title}</span>
            <span className="block font-display text-lg tracking-wide text-fg">yoxshin</span>
          </span>
        </a>

        <nav aria-label={t('ui.toc')} className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {sections.map((s) => (
            <NavLink key={s.id} section={s} active={active} label={t(`ui.nav.${s.navKey}`)} />
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 border-l border-line pl-4 lg:ml-0">
          <LanguageSwitcher />
          <a
            href="#sources"
            className="chamfer hidden items-center gap-1.5 bg-accent-cyan px-3.5 py-2 font-mono text-2xs font-bold uppercase tracking-wider text-ink-950 transition-colors hover:bg-fg sm:inline-flex"
          >
            {t('ui.cite')}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          <button
            type="button"
            className="p-1.5 text-fg-muted hover:text-fg lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={t('ui.toc')}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label={t('ui.toc')}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-line bg-ink-950 lg:hidden"
          >
            <div className="mx-auto flex max-w-page flex-col px-4 py-3 sm:px-6">
              {sections.map((s) => (
                <NavLink key={s.id} section={s} active={active} label={t(`ui.nav.${s.navKey}`)} onClick={() => setOpen(false)} />
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
