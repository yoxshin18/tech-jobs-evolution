/** Colonne verticali della griglia strutturale, fisse dietro al contenuto. */
export default function GridBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-grid-fade" />
      <div className="mx-auto h-full max-w-page px-4 sm:px-6">
        <div className="structural-grid h-full border-x border-line/70" />
      </div>
    </div>
  );
}
