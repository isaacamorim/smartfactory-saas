// src/components/Form.jsx
import { useState } from "react";

/**
 * Formulário reutilizável do Smart Factory
 *
 * Props:
 *  title?:    string
 *  fields:    Array<{ name, label, type?, placeholder?, options?, default?, full? }>
 *  onSubmit:  (values) => void
 *  onCancel?: () => void
 *  submitLabel?: string
 */
export default function Form({ title, fields, onSubmit, onCancel, submitLabel = "SALVAR" }) {
  const [values, setValues] = useState(
    () => Object.fromEntries(fields.map(f => [f.name, f.default ?? ""]))
  );

  const set = (name, val) => setValues(v => ({ ...v, [name]: val }));

  return (
    <div style={{ background: "var(--bg2)", border: "1px solid var(--border2)", padding: 28 }}>
      {title && (
        <div style={{
          fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700,
          letterSpacing: 2, color: "#fff", textTransform: "uppercase",
          marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 14,
        }}>{title}</div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {fields.map(f => (
          <div key={f.name} style={{ gridColumn: f.full ? "1 / -1" : "auto" }}>
            {/* Label */}
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 2,
              color: "var(--text3)", marginBottom: 6,
            }}>{f.label}</div>

            {/* Select */}
            {f.type === "select" ? (
              <select
                className="sf-select"
                value={values[f.name]}
                onChange={e => set(f.name, e.target.value)}
              >
                {f.options?.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            ) : f.type === "textarea" ? (
              <textarea
                className="sf-input"
                rows={3}
                placeholder={f.placeholder ?? ""}
                value={values[f.name]}
                onChange={e => set(f.name, e.target.value)}
                style={{ resize: "vertical" }}
              />
            ) : (
              <input
                className="sf-input"
                type={f.type ?? "text"}
                placeholder={f.placeholder ?? ""}
                value={values[f.name]}
                onChange={e => set(f.name, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
        {onCancel && (
          <button className="btn btn-ghost" onClick={onCancel}>CANCELAR</button>
        )}
        <button className="btn btn-solid" onClick={() => onSubmit(values)}>
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
