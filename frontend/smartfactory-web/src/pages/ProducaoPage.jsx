// src/pages/ProducaoPage.jsx
import Table from "../components/Table";
import { OEEMiniBar, PageHeader } from "../components/UI";
import { MACHINES } from "../data/mockData";

const META = 5200;

export default function ProducaoPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Produção" sub="TURNO ATUAL · TODAS AS LINHAS" />

      {/* Production counters */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {MACHINES.map(m => {
          const pct = Math.round(m.boas / META * 100);
          return (
            <div key={m.id} className="sf-card animate-up">
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
                <span className="serial">{m.serial}</span>
                <span className={`chip chip-${m.status==="online"?"green":"red"}`}>{m.status==="online"?"PRODUZINDO":"PARADA"}</span>
              </div>
              <div style={{ padding: 16 }}>
                {/* Big counter */}
                <div style={{ textAlign: "center", padding: "16px 0", borderBottom: "1px solid var(--border)", marginBottom: 14 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 3, color: "var(--text3)", marginBottom: 4 }}>BOAS</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 52, fontWeight: 700, color: "var(--green)", lineHeight: 1 }}>
                    {m.boas.toLocaleString()}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 2, color: "var(--text3)", marginTop: 4 }}>UNIDADES</div>
                </div>

                {/* Progress to goal */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 1, color: "var(--text3)" }}>META: {META.toLocaleString()} un</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: pct >= 100 ? "var(--green)" : "var(--text2)" }}>{pct}%</span>
                  </div>
                  <div className="prog-track" style={{ height: 8 }}>
                    <div className="prog-fill" style={{ width: `${Math.min(pct, 100)}%`, background: pct >= 90 ? "var(--green)" : "var(--orange)" }} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[["REPROVADOS", m.ruins, "var(--red)"], ["VELOCIDADE", `${m.vel}/m`, "var(--cyan)"]].map(([l,v,c]) => (
                    <div key={l} style={{ background: "var(--bg2)", border: "1px solid var(--border)", padding: "8px 10px" }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 1, color: "var(--text3)", marginBottom: 4 }}>{l}</div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: c }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary table */}
      <div className="sf-card">
        <div className="sf-card-header"><span className="sf-card-title">Resumo por Linha</span></div>
        <Table
          data={MACHINES}
          columns={[
            { key:"serial",  label:"Serial",     render: v => <span className="serial">{v}</span> },
            { key:"linha",   label:"Linha"    },
            { key:"turno",   label:"Operador" },
            { key:"boas",    label:"Boas",    render: v => <span style={{ color: "var(--green)" }}>{v.toLocaleString()}</span> },
            { key:"ruins",   label:"Reprov.", render: v => <span style={{ color: v > 0 ? "var(--red)" : "var(--text3)" }}>{v}</span> },
            { key:"vel",     label:"Velocidade", render: v => `${v} pct/min` },
            { key:"oee",     label:"OEE",     render: v => <OEEMiniBar value={v} /> },
          ]}
        />
      </div>
    </div>
  );
}
