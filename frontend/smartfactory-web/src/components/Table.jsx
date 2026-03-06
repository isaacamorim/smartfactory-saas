// src/components/Table.jsx

/**
 * Tabela reutilizável do Smart Factory
 *
 * Props:
 *  columns: Array<{ key, label, render? }>
 *  data:    Array<object>
 *  onRowClick?: (row) => void
 *  emptyMessage?: string
 */
export default function Table({ columns, data = [], onRowClick, emptyMessage = "Nenhum registro encontrado." }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="sf-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: "center", padding: 32, color: "var(--text3)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 2 }}>
                {emptyMessage.toUpperCase()}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.id ?? i} onClick={() => onRowClick?.(row)}>
                {columns.map(col => (
                  <td key={col.key}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
