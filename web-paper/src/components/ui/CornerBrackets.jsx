/** Quattro angolari decorativi attorno al contenitore padre (position: relative). */
export default function CornerBrackets({ color = 'border-fg-faint', size = 'h-2.5 w-2.5', inset = '-inset-px' }) {
  const base = `pointer-events-none absolute ${size} ${color}`;
  return (
    <span aria-hidden="true" className={`pointer-events-none absolute ${inset}`}>
      <span className={`${base} left-0 top-0 border-l border-t`} />
      <span className={`${base} right-0 top-0 border-r border-t`} />
      <span className={`${base} bottom-0 left-0 border-b border-l`} />
      <span className={`${base} bottom-0 right-0 border-b border-r`} />
    </span>
  );
}
