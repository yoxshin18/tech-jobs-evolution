import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Languages } from 'lucide-react';
import { LANGUAGES } from '../../i18n.js';

/** Selettore lingua a tendina, ancorato in alto a destra nell'header. */
export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const itemRefs = useRef([]);

  const active = LANGUAGES.find((l) => l.code === i18n.resolvedLanguage) ?? LANGUAGES[0];
  const activeIndex = LANGUAGES.indexOf(active);

  // Chiude il menu al clic fuori e con Escape; l'Escape riporta il focus al pulsante.
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        rootRef.current?.querySelector('button')?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) itemRefs.current[activeIndex]?.focus();
  }, [open, activeIndex]);

  const select = (code) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  // Frecce e Home/End spostano il focus tra le voci del menu.
  const onItemKeyDown = (e, index) => {
    const last = LANGUAGES.length - 1;
    const moves = {
      ArrowDown: index === last ? 0 : index + 1,
      ArrowUp: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    };
    if (moves[e.key] != null) {
      e.preventDefault();
      itemRefs.current[moves[e.key]]?.focus();
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t('ui.language')}: ${t(`ui.languages.${active.code}`)}`}
        className="flex items-center gap-1.5 border border-line bg-surface-sunken px-2 py-1.5 font-mono text-2xs text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
      >
        <Languages className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="text-fg">{active.label}</span>
        <ChevronDown
          className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label={t('ui.language')}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 top-full z-50 mt-1.5 w-44 border border-line-strong bg-surface shadow-card"
          >
            {LANGUAGES.map((lang, index) => {
              const isActive = lang.code === active.code;
              return (
                <button
                  key={lang.code}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isActive}
                  onClick={() => select(lang.code)}
                  onKeyDown={(e) => onItemKeyDown(e, index)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left font-mono text-2xs transition-colors ${
                    isActive ? 'bg-surface-sunken text-fg' : 'text-fg-muted hover:bg-surface-sunken hover:text-fg'
                  }`}
                >
                  <Check
                    className={`h-3 w-3 shrink-0 text-accent-cyan ${isActive ? '' : 'invisible'}`}
                    aria-hidden="true"
                  />
                  <span className="flex-1">{t(`ui.languages.${lang.code}`)}</span>
                  <span className="text-fg-faint">{lang.label}</span>
                  {!lang.complete && (
                    <span className="text-accent-amber" title={t('ui.languageBeta')}>
                      ·
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
