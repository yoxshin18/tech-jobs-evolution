/** Logo-marca: riquadro con "occhi" a pixel, reinterpretazione del marchio di riferimento. */
export default function PixelMark({ className = 'h-9 w-9' }) {
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
      <rect x="2" y="2" width="32" height="32" rx="8" fill="none" stroke="#38BDF8" strokeWidth="3" />
      <rect x="9" y="9" width="18" height="18" rx="3" fill="#131B2E" />
      <rect x="12" y="15" width="4" height="4" fill="#F8FAFC" />
      <rect x="20" y="15" width="4" height="4" fill="#F8FAFC" />
      <rect x="0" y="16" width="5" height="4" fill="#0A0F1D" />
    </svg>
  );
}
