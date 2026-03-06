// src/pages/OEEPage.jsx
import { useState } from "react";
import { OEEGauge, ProgressBar, PageHeader } from "../components/UI";
import { MACHINES } from "../data/mockData";

const OEE_HOURS = ["06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00"];

export default function OEEPage() {
  const [serial, setSerial] = useState(MACHINES[0].serial);
  const machine = MACHINES.find(m => m.serial === serial) ?? MACHINES[0];

  const components = [
    { label:"OEE",             value: machine.oee, color:"var(--cyan)",   formula:"D × P × Q" },
    { label:"DISPONIBILIDADE", value: 88.1,         color:"var(--cyan)",   formula:"Tempo Prod / Tempo Plan" },
    { label:"PERFORMANCE",     value: 91.4,         color:"var(--green)",  formula:"Prod Real / Prod Teórica" },
    { label:"QUALIDADE",       value: 98.2,         color:"var(--yellow)", formula:"Boas / Total Produzido" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Análise OEE"
        sub="OVERALL EQUIPMENT EFFECTIVENESS"
        action={
          <select className="sf-select" style={{ width: 220 }} value={serial} onChange={e => setSerial(e.target.value)}>
            {MACHINES.map(m => <option key={m.serial} value={m.serial}>{m.serial}</option>)}
          </select>
        }
      />

      {/* 4 Gauge cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {components.map(c => (
          <div key={c.label} className="sf-card" style={{ padding: 20 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 3, color: "var(--text3)", marginBottom: 12 }}>{c.label}</div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <OEEGauge value={c.value} size={130} color={c.color} label={c.label.slice(0,5)} />
            </div>
            <div className="prog-track" style={{ marginTop: 14 }}>
              <div className="prog-fill" style={{ width: `${c.value}%`, background: c.color }} />
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text3)", marginTop: 6, letterSpacing: 1 }}>{c.formula}</div>
          </div>
        ))}
      </div>

      {/* Trend chart */}
      <div className="sf-card">
        <div className="sf-card-header">
          <span className="sf-card-title">Histórico OEE — Últimas 8h</span>
          <span className="badge badge-info">{serial}</span>
        </div>
        <div className="sf-card-body">
          <svg width="100%" height="140" viewBox="0 0 800 140" preserveAspectRatio="none" style={{ overflow: "visible" }}>
            {[0,25,50,75,100].map(y => (
              <line key={y} x1="0" y1={140-y*1.4} x2="800" y2={140-y*1.4} stroke="var(--border)" strokeWidth="1" />
            ))}
            <polyline
              points="0,78 100,70 200,74 300,60 400,64 500,52 600,57 700,46 800,50"
              fill="none" stroke="var(--cyan)" strokeWidth="2.5"
              style={{ filter: "drop-shadow(0 0 4px var(--cyan))" }}
            />
            <polyline
              points="0,78 100,70 200,74 300,60 400,64 500,52 600,57 700,46 800,50 800,140 0,140"
              fill="rgba(0,229,255,0.06)" stroke="none"
            />
            {/* Meta line */}
            <line x1="0" y1={140-85*1.4} x2="800" y2={140-85*1.4} stroke="var(--orange)" strokeWidth="1.5" strokeDasharray="8 4" />
            <text x="806" y={140-85*1.4+4} fontFamily="Share Tech Mono" fontSize="9" fill="var(--orange)">META 85%</text>
          </svg>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            {OEE_HOURS.map(h => <span key={h} style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text3)" }}>{h}</span>)}
          </div>
        </div>
      </div>

      {/* Meta vs realizado */}
      <div className="sf-card">
        <div className="sf-card-header"><span className="sf-card-title">Metas vs Realizado</span></div>
        <div className="sf-card-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            <ProgressBar label="Disponibilidade" value={88.1} meta={85} color="var(--cyan)"   />
            <ProgressBar label="Performance"     value={91.4} meta={85} color="var(--green)"  />
            <ProgressBar label="Qualidade"       value={98.2} meta={98} color="var(--yellow)" />
          </div>
        </div>
      </div>
    </div>
  );
}
