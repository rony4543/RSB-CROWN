import { Trash2 } from 'lucide-react';

export default function RepeatableTable({
  columns, rows, onChange, onAddRow, onRemoveRow, addLabel = '+ जोड़ें'
}) {
  const handleCellChange = (rowIndex, colKey, value) => {
    const updated = rows.map((row, i) => {
      if (i === rowIndex) return { ...row, [colKey]: value };
      return row;
    });
    onChange(updated);
  };

  return (
    <div className="repeatable-table-wrapper">
      <table className="repeatable-table">
        <thead>
          <tr>
            <th style={{width: '40px'}}>#</th>
            {columns.map((col, i) => (
              <th key={i} style={col.width ? { width: col.width } : {}}>
                {col.label}{col.required && <span className="required-mark"> *</span>}
              </th>
            ))}
            <th style={{width: '50px'}}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              <td style={{textAlign: 'center', color: '#9ca3af', fontSize: '12px'}}>{ri + 1}</td>
              {columns.map((col, ci) => (
                <td key={ci}>
                  {col.type === 'select' ? (
                    <select
                      value={row[col.key] || ''}
                      onChange={e => handleCellChange(ri, col.key, e.target.value)}
                    >
                      <option value="">चुनें</option>
                      {(col.options || []).map((opt, oi) => (
                        <option key={oi} value={typeof opt === 'string' ? opt : opt.value}>
                          {typeof opt === 'string' ? opt : opt.label}
                        </option>
                      ))}
                    </select>
                  ) : col.type === 'number' ? (
                    <input
                      type="number"
                      value={row[col.key] ?? ''}
                      onChange={e => handleCellChange(ri, col.key, e.target.value)}
                      min="0"
                      inputMode="numeric"
                    />
                  ) : col.readOnly ? (
                    <input
                      type="text"
                      value={row[col.key] ?? ''}
                      readOnly
                      style={{ background: '#fff8f0', fontWeight: 600 }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={row[col.key] || ''}
                      onChange={e => handleCellChange(ri, col.key, e.target.value)}
                    />
                  )}
                </td>
              ))}
              <td className="row-actions">
                <button className="btn-icon" onClick={() => onRemoveRow(ri)} title="हटाएँ">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn-add-row" onClick={onAddRow}>
        {addLabel}
      </button>
    </div>
  );
}
