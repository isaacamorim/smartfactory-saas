// src/pages/MetasPage.jsx
import { useState } from "react";
import Form from "../components/Form";
import { ProgressBar, PageHeader } from "../components/UI";
import { MACHINES } from "../data/mockData";

const WORLD_CLASS = [
  { label:"OEE World Class",    value:85,   color:"var(--cyan)"   },
  { label:"Disponibilidade",    value:90,   color:"var(--green)"  },
  { label:"Performance",        value:95,   color:"var(--green)"  },
  { label:"Qualidade",          value:99.9, color:"var(--yellow)" },
];

export default function MetasPage() {
  const [serial, setSerial] = useState(MACHINES[0].serial);

  const FORM_FIELDS = [
    { name:"serial",       label:"Máquina", type:"select", options: MACHINES.map(m => ({ value:m.serial, label:m.serial })), default: serial },
    { name:"meta_prod",    label:"Meta Produção / Hora",  placeholder:"650", default:"650"  },
    { name:"meta_disp",    label:"Meta Disponibilidade %", placeholder:"85", default:"85"   },
    { name:"meta_perf",    label:"Meta Performance %",    placeholder:"85",  default:"85"   },
    { name:"meta_qual",    label:"Meta Qualidade %",      placeholder:"98",  default:"98"   },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Metas OEE" sub="CONFIGURAÇÃO DE TARGETS POR MÁQUINA" />

      <div style={{ display: "flex", gap: 16 }}>
        {/* Form */}
        <div style={{ flex: 1 }}>
          <Form
            title={`Configurar Metas — ${serial}`}
            fields={FORM_FIELDS}
            onSubmit={(v) => { setSerial(v.serial); alert(`Metas salvas para ${v.serial}!`); }}
          />
        </div>

        {/* Reference panel */}
        <div style={{ width: 280 }}>
          <div className="sf-card" style={{ height: "100%" }}>
            <div className="sf-card-header"><span className="sf-card-title">Referência Mundial</span></div>
            <div className="sf-card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {WORLD_CLASS.map(w => (
                <ProgressBar key={w.label} label={w.label} value={w.value} color={w.color} />
              ))}

              {/* Formula box */}
              <div style={{ marginTop: 8, padding: 14, background: "var(--bg2)", border: "1px solid var(--border)" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 2, color: "var(--text3)", marginBottom: 8 }}>FÓRMULA OEE</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--primary)", lineHeight: 2 }}>
                  OEE = D × P × Q<br/>
                  <span style={{ color: "var(--text3)" }}>Ex: 85% × 95% × 99.9%</span><br/>
                  <span style={{ color: "var(--green)" }}>= 80.9%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
