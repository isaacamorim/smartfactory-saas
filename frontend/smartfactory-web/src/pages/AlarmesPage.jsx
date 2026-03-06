// src/pages/AlarmesPage.jsx
import { useState } from "react";
import { StatCard, SevBar, PageHeader } from "../components/UI";
import { ALARMS } from "../data/mockData";

const FILTERS = ["todos","ativos","critical","warn","info"];

export default function AlarmesPage() {
  const [filter, setFilter] = useState("todos");

  const filtered = ALARMS.filter(a =>
    filter === "todos"   ? true :
    filter === "ativos"  ? a.ativo :
    a.sev === filter
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Alarmes"
        sub="MONITORAMENTO DE FALHAS E EVENTOS"
        action={
          <div style={{ display: "flex", gap: 8 }}>
            {FILTERS.map(f => (
              <button key={f} className={`btn ${filter === f ? "btn-primary" : "btn-ghost"}`}
                style={{ padding: "6px 14px", fontSize: 11 }}
                onClick={() => setFilter(f)}
              >{f.toUpperCase()}</button>
            ))}
          </div>
        }
      />

      {/* Counters */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        <StatCard label="Total"       value={ALARMS.length}                             accent="var(--text)"   />
        <StatCard label="Críticos"    value={ALARMS.filter(a=>a.sev==="critical").length} accent="var(--red)"    />
        <StatCard label="Avisos"      value={ALARMS.filter(a=>a.sev==="warn").length}    accent="var(--orange)" />
        <StatCard label="Ativos Agora" value={ALARMS.filter(a=>a.ativo).length}          accent="var(--cyan)"   />
      </div>

      {/* Alarm list */}
      <div className="sf-card">
        <div className="sf-card-header">
          <span className="sf-card-title">Histórico de Alarmes</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text3)" }}>{filtered.length} REGISTROS</span>
        </div>
        <div>
          {filtered.map(a => (
            <div
              key={a.id}
              style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 20px", borderBottom: "1px solid var(--border)", cursor: "pointer", transition: "background .15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(0,229,255,0.03)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <SevBar sev={a.sev} />

              {/* Icon box */}
              <div style={{
                width: 36, height: 36, flexShrink: 0,
                border: `1px solid ${a.sev==="critical"?"var(--red)":a.sev==="warn"?"var(--orange)":"var(--cyan)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: a.sev==="critical"?"var(--red)":a.sev==="warn"?"var(--orange)":"var(--cyan)", fontSize: 14,
              }}>
                {a.sev==="critical" ? "⊗" : a.sev==="warn" ? "△" : "ℹ"}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 3 }}>{a.nome}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text3)" }}>{a.maquina} · {a.linha}</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <span className={`chip chip-${a.ativo ? "green" : "gray"}`}>{a.ativo ? "ATIVO" : "FECHADO"}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text3)" }}>{a.hora}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
