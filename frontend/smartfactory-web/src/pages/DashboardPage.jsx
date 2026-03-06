// src/pages/DashboardPage.jsx
import { useState, useEffect } from "react";
import Table from "../components/Table";
import { StatCard, OEEGauge, OEEMiniBar, PageHeader, SevBar } from "../components/UI";
import { MACHINES, ALARMS } from "../data/mockData";

export default function DashboardPage() {
  const [liveOee, setLiveOee] = useState(75.3);

  // Simula atualização ao vivo — substituir por metricsAPI.oee()
  useEffect(() => {
    const t = setInterval(() => setLiveOee(+(74 + Math.random() * 3).toFixed(1)), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Dashboard Industrial"
        sub={`TURNO 06:00–14:00 · 3 MÁQUINAS · ${new Date().toLocaleDateString("pt-BR")}`}
        action={<button className="btn btn-primary">+ NOVA MÁQUINA</button>}
      />

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        <StatCard label="OEE Médio — Turno"   value={liveOee} unit="%" delta="▲ +3.1% vs turno anterior" deltaPos accent="var(--cyan)" />
        <StatCard label="Produção Total"        value="4.821"   unit="un" delta="Meta: 5.200 un (92%)"       deltaPos accent="var(--green)"  />
        <StatCard label="Pacotes Reprovados"    value="89"      unit="un" delta="▲ +12 vs média do turno"    deltaPos={false} accent="var(--orange)" />
        <StatCard label="Alarmes Ativos"        value="2"               delta="EVA1000-00022 parada"         deltaPos={false} accent="var(--red)"    />
      </div>

      {/* OEE gauge + Alarms */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

        {/* OEE */}
        <div className="sf-card">
          <div className="sf-card-header">
            <span className="sf-card-title">OEE — EVA1000-00021</span>
            <span className="badge badge-live">● LIVE</span>
          </div>
          <div className="sf-card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <OEEGauge value={liveOee} size={164} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, width: "100%" }}>
              {[["DISP.","88.1","var(--cyan)",88],["PERF.","91.4","var(--green)",91],["QUAL.","98.2","var(--yellow)",98]].map(([l,v,c,p]) => (
                <div key={l} style={{ background: "var(--bg2)", border: "1px solid var(--border)", padding: "10px 12px", textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 2, color: "var(--text3)", marginBottom: 5 }}>{l}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: c }}>{v}%</div>
                  <div className="prog-track" style={{ marginTop: 6 }}>
                    <div className="prog-fill" style={{ width: `${p}%`, background: c }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alarms */}
        <div className="sf-card">
          <div className="sf-card-header">
            <span className="sf-card-title">Alarmes Ativos</span>
            <span className="badge badge-warn">2 ATIVOS</span>
          </div>
          <div className="sf-card-body" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {ALARMS.map(a => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <SevBar sev={a.sev} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#fff", marginBottom: 2 }}>{a.nome}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text3)" }}>{a.maquina} · {a.linha}</div>
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text3)" }}>{a.hora}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Machine table */}
      <div className="sf-card">
        <div className="sf-card-header">
          <span className="sf-card-title">Máquinas — Status</span>
          <span className="badge badge-live">● TEMPO REAL</span>
        </div>
        <Table
          data={MACHINES}
          columns={[
            { key:"serial", label:"Serial",    render: v => <span className="serial">{v}</span> },
            { key:"modelo", label:"Modelo"  },
            { key:"linha",  label:"Linha"   },
            { key:"status", label:"Status",  render: v => <span className={`chip chip-${v==="online"?"green":"red"}`}>{v==="online"?"RODANDO":"PARADA"}</span> },
            { key:"vel",    label:"Veloc.",  render: v => `${v} pct/min` },
            { key:"oee",    label:"OEE",     render: v => <OEEMiniBar value={v} /> },
          ]}
        />
      </div>
    </div>
  );
}
