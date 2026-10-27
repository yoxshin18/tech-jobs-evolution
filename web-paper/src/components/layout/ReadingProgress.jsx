import { motion, useScroll, useSpring } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function ReadingProgress() {
  const { t } = useTranslation();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      role="progressbar"
      aria-label={t('ui.readingProgress')}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-accent-cyan via-accent-indigo to-accent-emerald"
      style={{ scaleX }}
    />
  );
}
