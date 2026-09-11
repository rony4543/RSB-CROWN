export default function RadioGroup({
  label, name, value, onChange, options = [], required = false, error
}) {
  return (
    <div className="radio-group">
      <span className="radio-group-label">
        {label}{required && <span className="required-mark"> *</span>}
      </span>
      <div className="radio-options">
        {options.map((opt, i) => {
          const optValue = typeof opt === 'string' ? opt : opt.value;
          const optLabel = typeof opt === 'string' ? opt : opt.label;
          const inputId = `${name}_${i}`;
          return (
            <div className="radio-option" key={i}>
              <input
                type="radio"
                id={inputId}
                name={name}
                value={optValue}
                checked={value === optValue}
                onChange={() => onChange(name, optValue)}
              />
              <label htmlFor={inputId}>
                <span className="radio-dot"></span>
                {optLabel}
              </label>
            </div>
          );
        })}
      </div>
      {error && <div className="field-error" style={{ marginTop: '4px' }}>⚠ {error}</div>}
    </div>
  );
}
