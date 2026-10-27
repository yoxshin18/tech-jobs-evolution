/** Gruppo di filtri a chip (singola o multipla selezione). */
export default function Chips({ options, value, onChange, multiple = false, label, className = '' }) {
  const isOn = (key) => (multiple ? value.includes(key) : value === key);
  const toggle = (key) => {
    if (!multiple) return onChange(key);
    if (value.includes(key)) {
      if (value.length > 1) onChange(value.filter((k) => k !== key));
    } else {
      onChange([...value, key]);
    }
    return undefined;
  };
  return (
    <div role="group" aria-label={label} className={`flex flex-wrap gap-1.5 ${className}`}>
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          className="chip"
          aria-pressed={isOn(opt.key)}
          onClick={() => toggle(opt.key)}
        >
          {opt.color && (
            <span className="h-2 w-2 shrink-0" style={{ background: opt.color }} aria-hidden="true" />
          )}
          {opt.label}
        </button>
      ))}
    </div>
  );
}
