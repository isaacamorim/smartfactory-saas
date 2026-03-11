// src/components/Form.jsx
import { useState } from "react";

export default function Form({ title, fields, onSubmit, onCancel, submitLabel = "Salvar", initialValues = {} }) {
  const [values, setValues] = useState(
    () => Object.fromEntries(fields.map(f => [f.name, initialValues[f.name] ?? f.default ?? ""]))
  );
  const set = (name, val) => setValues(v => ({ ...v, [name]: val }));

  return (
    <div>
      {title && (
        <div style={{
          fontFamily:"var(--font-display)", fontSize:14, fontWeight:700, color:"var(--text)",
          marginBottom:18, paddingBottom:14, borderBottom:"1px solid var(--border)",
        }}>{title}</div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        {fields.map(f => (
          <div key={f.name} style={{ gridColumn: f.full ? "1 / -1" : "auto" }}>
            <div style={{ fontFamily:"var(--font-body)", fontSize:11, fontWeight:600,
              color:"var(--text2)", marginBottom:5, letterSpacing:.3, textTransform:"uppercase" }}>
              {f.label}{f.required && <span style={{ color:"var(--red)", marginLeft:3 }}>*</span>}
            </div>

            {f.type === "select" ? (
              <select className="sf-select" value={values[f.name]} onChange={e => set(f.name, e.target.value)}>
                <option value="">— selecione —</option>
                {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : f.type === "textarea" ? (
              <textarea className="sf-input" rows={3} placeholder={f.placeholder ?? ""}
                value={values[f.name]} onChange={e => set(f.name, e.target.value)}
                style={{ resize:"vertical" }} />
            ) : (
              <input className="sf-input" type={f.type ?? "text"} placeholder={f.placeholder ?? ""}
                value={values[f.name]} onChange={e => set(f.name, e.target.value)} />
            )}
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:8, marginTop:20, justifyContent:"flex-end" }}>
        {onCancel && <button className="btn btn-ghost" onClick={onCancel}>Cancelar</button>}
        <button className="btn btn-solid" onClick={() => onSubmit(values)}>{submitLabel}</button>
      </div>
    </div>
  );
}
