// src/pages/MaquinasPage.jsx
import { useState } from "react";
import Table from "../components/Table";
import Form from "../components/Form";
import { OEEMiniBar, PageHeader } from "../components/UI";
import { MACHINES } from "../data/mockData";

const FORM_FIELDS = [
  { name:"serial",  label:"Serial Number",  placeholder:"EVA1000-00045" },
  { name:"modelo",  label:"Modelo",         placeholder:"EVA1000" },
  { name:"empresa", label:"Empresa", type:"select", options:[{ value:"nh", label:"NH Alimentos" }] },
  { name:"linha",   label:"Linha",   type:"select", options:[{ value:"l1",label:"Linha 01"},{value:"l2",label:"Linha 02"},{value:"l3",label:"Linha 03"}] },
];

export default function MaquinasPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Máquinas"
        sub="GERENCIAMENTO DE EQUIPAMENTOS"
        action={<button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>+ CADASTRAR MÁQUINA</button>}
      />

      {showForm && (
        <div className="animate-up">
          <Form
            title="Cadastrar Nova Máquina"
            fields={FORM_FIELDS}
            onSubmit={(v) => { alert(`Máquina ${v.serial} cadastrada!`); setShowForm(false); }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Machine cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {MACHINES.map(m => (
          <div key={m.id} className="sf-card animate-up">
            <div style={{ padding: "13px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="serial">{m.serial}</span>
              <span className={`chip chip-${m.status==="online"?"green":"red"}`}>{m.status==="online"?"ONLINE":"OFFLINE"}</span>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                {[["MODELO",m.modelo],["EMPRESA",m.empresa],["LINHA",m.linha],["OPERADOR",m.turno]].map(([l,v]) => (
                  <div key={l}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 2, color: "var(--text3)", marginBottom: 3 }}>{l}</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[["OEE",`${m.oee}%`,"var(--cyan)"],["BOAS",m.boas.toLocaleString(),"var(--green)"],["VEL",`${m.vel}/m`,"var(--text2)"]].map(([l,v,c]) => (
                  <div key={l} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 1, color: "var(--text3)", marginBottom: 4 }}>{l}</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: c }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full table */}
      <div className="sf-card">
        <div className="sf-card-header"><span className="sf-card-title">Todas as Máquinas</span></div>
        <Table
          data={MACHINES}
          columns={[
            { key:"serial",  label:"Serial",   render: v => <span className="serial">{v}</span> },
            { key:"modelo",  label:"Modelo"  },
            { key:"empresa", label:"Empresa" },
            { key:"linha",   label:"Linha"   },
            { key:"status",  label:"Status",  render: v => <span className={`chip chip-${v==="online"?"green":"red"}`}>{v==="online"?"ONLINE":"OFFLINE"}</span> },
            { key:"oee",     label:"OEE",     render: v => <OEEMiniBar value={v} /> },
            { key:"boas",    label:"Produção", render: v => v.toLocaleString() },
            { key:"turno",   label:"Operador" },
          ]}
        />
      </div>
    </div>
  );
}
