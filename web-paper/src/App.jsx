import { useEffect, useMemo } from 'react';
import { MotionConfig } from 'framer-motion';
import { useLocaleData } from './hooks/useLocaleData.js';
import { useActiveSection } from './hooks/useActiveSection.js';
import { LANGUAGES } from './i18n.js';
import Footer from './components/layout/Footer.jsx';
import GridBackdrop from './components/layout/GridBackdrop.jsx';
import Header from './components/layout/Header.jsx';
import ReadingProgress from './components/layout/ReadingProgress.jsx';
import Hero from './components/paper/Hero.jsx';
import Section from './components/paper/Section.jsx';

export default function App() {
  const { t, get, i18n } = useLocaleData();
  // Le sezioni cambiano solo al cambio lingua: memo per avere riferimenti stabili.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sections = useMemo(() => get('sections', []), [i18n.language]);

  // Numerazione progressiva delle figure nell'ordine in cui compaiono nel testo.
  const figureNumbers = useMemo(() => {
    const map = {};
    let n = 0;
    sections.forEach((s) =>
      s.blocks.forEach((b) => {
        if (b.type === 'figure' && map[b.chart] == null) {
          n += 1;
          map[b.chart] = n;
        }
      }),
    );
    return map;
  }, [sections]);

  const sectionIds = useMemo(() => sections.map((s) => s.id), [sections]);
  const subIds = useMemo(
    () => sections.flatMap((s) => s.blocks.filter((b) => b.type === 'h3').map((b) => b.id)),
    [sections],
  );
  const active = useActiveSection(sectionIds);
  const activeSub = useActiveSection(subIds);

  useEffect(() => {
    document.title = t('meta.pageTitle');
  }, [t, i18n.language]);

  const lang = LANGUAGES.find((l) => l.code === i18n.resolvedLanguage);

  return (
    <MotionConfig reducedMotion="user">
      <ReadingProgress />
      <GridBackdrop />
      <Header sections={sections} active={active} />
      {lang && !lang.complete && (
        <div className="border-b border-accent-amber/30 bg-accent-amber/10 px-4 py-2 text-center font-mono text-2xs text-accent-amber">
          {t('ui.translationNotice')}
        </div>
      )}
      <main id="main">
        <Hero figureCount={Object.keys(figureNumbers).length} />
        {sections.map((section) => (
          <Section key={section.id} section={section} figureNumbers={figureNumbers} activeSub={activeSub} />
        ))}
      </main>
      <Footer />
    </MotionConfig>
  );
}
