import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function CiteBlock({ label, text }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const full = `${text} ${window.location.href.split('#')[0]}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(full);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard non disponibile */
    }
  };
  return (
    <div className="my-10 border border-line bg-surface-sunken p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="label-mono">{label}</p>
        <button type="button" onClick={copy} className="chip" aria-live="polite">
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? t('ui.citeCopied') : t('ui.cite')}
        </button>
      </div>
      <p className="break-words font-mono text-xs leading-relaxed text-fg">{full}</p>
    </div>
  );
}
