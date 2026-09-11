import { useState } from 'react';

export default function FloatingTextarea({
  label, name, value, onChange, required = false,
  error, disabled = false, rows = 3
}) {
  const hasValue = value !== undefined && value !== null && value !== '';

  return (
    <div className={`floating-field textarea-field${error ? ' has-error' : ''}${hasValue ? ' has-value' : ''}`}>
      <textarea
        id={name}
        name={name}
        className={`field-input${hasValue ? ' has-value' : ''}`}
        value={value || ''}
        onChange={e => onChange(name, e.target.value)}
        placeholder=" "
        disabled={disabled}
        rows={rows}
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
