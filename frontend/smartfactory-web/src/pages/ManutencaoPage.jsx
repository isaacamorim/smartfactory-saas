// src/pages/ManutencaoPage.jsx
import { useState } from "react";
import Table from "../components/Table";
import Form from "../components/Form";
import { StatCard, PageHeader } from "../components/UI";
import { MACHINES, MANUTENCAO } from "../data/mockData";

const OS_FIELDS = [
  { name:"serial",    label:"Máquina", type:"select", options: MACHINES.map(m => ({ value:m.serial, label:m.serial })) },
  { name:"tipo",      label:"Tipo",    type:"select", options: [{ value:"corretiva",label:"Corretiva"},{value:"preventiva",label:"Preventiva"}] },
  { name:"tecnico",   label:"Técnico", placeholder:"Nome do técnico" },
  { name:"descricao", label:"Descrição", type:"textarea", placeholder:"Descreva o problema ou serviço", full:true },
];

export default function ManutencaoPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Manutenção"
        sub="ORDENS DE SERVIÇO · CORRETIVA E PREVENTIVA"
        action={<button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>+ ABRIR OS</button>}
      />

      {showForm && (
        <div className="animate-up">
          <Form
            title="Abrir Ordem de Serviço"
            fields={OS_FIELDS}
            onSubmit={(v) => { alert(`OS aberta para ${v.serial}`); setShowForm(false); }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        <StatCard label="OS Abertas"          value={1}       accent="var(--red)"    />
        <StatCard label="OS Concluídas Hoje"  value={2}       accent="var(--green)"  />
        <StatCard label="MTTR Médio"          value="1h 12m"  accent="var(--orange)" />
        <StatCard label="Disponibilidade"     value="66%"     accent="var(--cyan)"   />
      </div>

      {/* OS table */}
      <div className="sf-card">
        <div className="sf-card-header"><span className="sf-card-title">Ordens de Serviço</span></div>
        <Table
          data={MANUTENCAO}
          columns={[
            { key:"id",       label:"OS #",    render: v => <span style={{ fontFamily:"var(--font-mono)", color:"var(--cyan)" }}>OS-{String(v).padStart(4,"0")}</span> },
            { key:"serial",   label:"Máquina", render: v => <span className="serial">{v}</span> },
            { key:"tipo",     label:"Tipo",    render: v => <span className={`chip chip-${v==="Corretiva"?"red":"orange"}`}>{v}</span> },
            { key:"descricao",label:"Descrição" },
            { key:"tecnico",  label:"Técnico"  },
            { key:"inicio",   label:"Início"   },
            { key:"fim",      label:"Fim"      },
            { key:"status",   label:"Status",  render: v => <span className={`chip chip-${v==="aberta"?"red":"green"}`}>{v==="aberta"?"ABERTA":"CONCLUÍDA"}</span> },
          ]}
        />
      </div>

      {/* Machine status cards */}
      <div className="sf-card">
        <div className="sf-card-header"><span className="sf-card-title">Status por Máquina</span></div>
        <div className="sf-card-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {MACHINES.map(m => (
              <div key={m.id} style={{
                background: "var(--bg1)",
                border: `1px solid ${m.status==="offline"?"var(--red)":"var(--border)"}`,
                padding: 16,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span className="serial">{m.serial}</span>
                  <span className={`chip chip-${m.status==="online"?"green":"red"}`}>{m.status==="online"?"OK":"PARADA"}</span>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 1, color: "var(--text3)", marginBottom: 5 }}>PRÓXIMA PREVENTIVA</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                  {m.status === "online" ? "25 horas" : "AGUARDANDO OS"}
                </div>
                {m.status === "offline" && (
                  <div style={{ marginTop: 10, padding: "6px 10px", background: "rgba(255,61,61,0.06)", border: "1px solid rgba(255,61,61,0.3)", fontSize: 11, color: "var(--red)" }}>
                    OS-0001 em andamento
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
