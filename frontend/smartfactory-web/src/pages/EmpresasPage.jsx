// src/pages/EmpresasPage.jsx
import { useState } from "react";
import Table from "../components/Table";
import Form from "../components/Form";
import { PageHeader } from "../components/UI";
import { EMPRESAS } from "../data/mockData";

export default function EmpresasPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Empresas"
        sub="GESTÃO MULTIEMPRESA"
        action={<button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>+ NOVA EMPRESA</button>}
      />

      {showForm && (
        <div className="animate-up">
          <Form
            title="Cadastrar Empresa"
            fields={[
              { name:"nome", label:"Razão Social", placeholder:"Nome da empresa" },
              { name:"cnpj", label:"CNPJ",         placeholder:"00.000.000/0001-00" },
            ]}
            onSubmit={(v) => { alert(`Empresa ${v.nome} cadastrada!`); setShowForm(false); }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="sf-card">
        <div className="sf-card-header"><span className="sf-card-title">Empresas Cadastradas</span></div>
        <Table
          data={EMPRESAS}
          columns={[
            { key:"id",       label:"ID",       render: v => <span style={{ fontFamily:"var(--font-mono)", color:"var(--text3)" }}>#{v}</span> },
            { key:"nome",     label:"Razão Social" },
            { key:"cnpj",     label:"CNPJ",     render: v => <span style={{ fontFamily:"var(--font-mono)", fontSize:11 }}>{v}</span> },
            { key:"maquinas", label:"Máquinas", render: v => <span style={{ fontFamily:"var(--font-display)", fontSize:18, color:"var(--cyan)" }}>{v}</span> },
            { key:"usuarios", label:"Usuários", render: v => <span style={{ fontFamily:"var(--font-display)", fontSize:18, color:"var(--green)" }}>{v}</span> },
          ]}
        />
      </div>
    </div>
  );
}
