import { useState } from 'react';

export default function FloatingInput({
  label, name, value, onChange, type = 'text', required = false,
  error, disabled = false, maxLength, min, inputMode, autoComplete = 'off'
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = value !== undefined && value !== null && value !== '';

  return (
    <div className={`floating-field${error ? ' has-error' : ''}${hasValue ? ' has-value' : ''}`}>
      <input
        id={name}
        name={name}
        type={type}
        className={`field-input${hasValue ? ' has-value' : ''}`}
        value={value || ''}
        onChange={e => onChange(name, e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder=" "
        disabled={disabled}
        maxLength={maxLength}
        min={min}
        inputMode={inputMode}
        autoComplete={autoComplete}
        aria-required={required}
        aria-invalid={!!error}
      />
      <label htmlFor={name} className="field-label">
        {label}{required && <span className="required-mark"> *</span>}
      </label>
      {error && <div className="field-error">⚠ {error}</div>}
    </div>
  );
}
