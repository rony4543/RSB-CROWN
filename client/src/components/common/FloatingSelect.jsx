export default function FloatingSelect({
  label, name, value, onChange, options = [], required = false,
  error, disabled = false, placeholder = 'चुनें...'
}) {
  return (
    <div className={`floating-field${error ? ' has-error' : ''}`}>
      <select
        id={name}
        name={name}
        className="field-input"
        value={value || ''}
        onChange={e => onChange(name, e.target.value)}
        disabled={disabled}
        aria-required={required}
        aria-invalid={!!error}
      >
        <option value="">{placeholder}</option>
        {options.map((opt, i) => (
          <option key={i} value={typeof opt === 'string' ? opt : opt.value}>
            {typeof opt === 'string' ? opt : opt.label}
          </option>
        ))}
      </select>
      <label htmlFor={name} className="field-label">
        {label}{required && <span className="required-mark"> *</span>}
      </label>
      {error && <div className="field-error">⚠ {error}</div>}
    </div>
  );
}
