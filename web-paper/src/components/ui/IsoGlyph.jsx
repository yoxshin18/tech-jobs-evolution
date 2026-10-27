/** Glifo isometrico a linee (equivalente del simbolo 3D del riferimento). */
export default function IsoGlyph({ className = 'h-20 w-20' }) {
  return (
    <svg viewBox="0 0 96 96" className={className} fill="none" stroke="#94A3B8" strokeWidth="1.25" aria-hidden="true">
      <path d="M48 14 L78 31 L48 48 L18 31 Z" />
      <path d="M18 31 V55 L48 72 V48" />
      <path d="M78 31 V55 L48 72" />
      <path d="M33 40 L63 23" stroke="#38BDF8" />
      <path d="M48 48 L48 82" strokeDasharray="2 3" />
      <path d="M63 56 L84 44 L84 62 L63 74 Z" stroke="#818CF8" />
    </svg>
  );
}
