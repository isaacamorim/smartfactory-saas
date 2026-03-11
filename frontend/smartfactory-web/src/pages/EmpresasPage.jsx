// src/pages/EmpresasPage.jsx
import { useState } from "react";
import Table from "../components/Table";
import Form from "../components/Form";
import { PageHeader, Feedback, Modal } from "../components/UI";
import { empresasAPI } from "../services/api";
import { useApi } from "../hooks/useApi";

const FIELDS = [
  { name:"nome", label:"Razão Social",  placeholder:"Ex: NH Alimentos Ltda", required:true },
  { name:"cnpj", label:"CNPJ",          placeholder:"00.000.000/0001-00",    required:true },
];

export default function EmpresasPage() {
  const { data: empresas, loading, refetch } = useApi(() => empresasAPI.listar());
  const [feedback,   setFeedback]   = useState(null);
  const [modalCriar, setModalCriar] = useState(false);
  const [editando,   setEditando]   = useState(null);
  const [deletando,  setDeletando]  = useState(null);

  const fb = (tipo, msg) => { setFeedback({ tipo, msg }); setTimeout(() => setFeedback(null), 4000); };

  const handleCriar = async (v) => {
    if (!v.nome || !v.cnpj) return fb("erro", "Nome e CNPJ são obrigatórios.");
    try {
      await empresasAPI.criar(v);
      fb("ok", `Empresa "${v.nome}" criada!`);
      setModalCriar(false); refetch();
    } catch (e) { fb("erro", e.message); }
  };

  const handleEditar = async (v) => {
    try {
      await empresasAPI.atualizar(editando.id, v);
      fb("ok", `Empresa "${v.nome}" atualizada.`);
      setEditando(null); refetch();
    } catch (e) { fb("erro", e.message); }
  };

  const handleDeletar = async () => {
    try {
      await empresasAPI.deletar(deletando.id);
      fb("ok", `Empresa "${deletando.nome}" desativada.`);
      setDeletando(null); refetch();
    } catch (e) { fb("erro", e.message); }
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <PageHeader
        title="Empresas"
        sub="GESTÃO MULTIEMPRESA"
        action={<button className="btn btn-solid" onClick={() => setModalCriar(true)}>+ Nova Empresa</button>}
      />

      <Feedback {...(feedback ?? {})} onClose={() => setFeedback(null)} />

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
        <div className="sf-card" style={{ padding:16 }}>
          <div style={{ fontSize:11, fontWeight:600, color:"var(--text3)", textTransform:"uppercase", marginBottom:8 }}>Total Ativas</div>
          <div style={{ fontFamily:"var(--font-display)", fontSize:32, fontWeight:800, color:"var(--primary)" }}>{empresas?.length ?? "—"}</div>
        </div>
        <div className="sf-card" style={{ padding:16 }}>
          <div style={{ fontSize:11, fontWeight:600, color:"var(--text3)", textTransform:"uppercase", marginBottom:8 }}>Status API</div>
          <div style={{ fontFamily:"var(--font-display)", fontSize:20, fontWeight:700, color: loading?"var(--orange)":empresas?"var(--green)":"var(--red)" }}>
            {loading ? "Carregando" : empresas ? "Online" : "Erro"}
          </div>
        </div>
        <div className="sf-card" style={{ padding:16 }}>
          <div style={{ fontSize:11, fontWeight:600, color:"var(--text3)", textTransform:"uppercase", marginBottom:8 }}>Última Atualização</div>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:14, fontWeight:500, color:"var(--text2)" }}>
            {new Date().toLocaleTimeString("pt-BR")}
          </div>
        </div>
      </div>

      <div className="sf-card">
        <div className="sf-card-header">
          <span className="sf-card-title">Empresas Cadastradas</span>
          {loading && <span className="badge badge-info">Carregando...</span>}
        </div>
        <Table
          data={empresas ?? []}
          emptyMessage="Nenhuma empresa cadastrada."
          columns={[
            { key:"id",        label:"ID",         render:v => <span style={{ fontFamily:"var(--font-mono)", color:"var(--text3)", fontSize:11 }}>#{v}</span> },
            { key:"nome",      label:"Razão Social" },
            { key:"cnpj",      label:"CNPJ",        render:v => <span style={{ fontFamily:"var(--font-mono)", fontSize:11 }}>{v}</span> },
            { key:"criado_em", label:"Cadastro",    render:v => new Date(v).toLocaleDateString("pt-BR") },
            {
              key:"_acoes", label:"Ações",
              render:(_,row) => (
                <div style={{ display:"flex", gap:6 }} onClick={e => e.stopPropagation()}>
                  <button className="btn btn-icon" title="Editar" onClick={() => setEditando(row)}>✎</button>
                  <button className="btn btn-icon danger" title="Desativar" onClick={() => setDeletando(row)}>✕</button>
                </div>
              )
            },
          ]}
        />
      </div>

      {modalCriar && (
        <Modal title="Nova Empresa" onClose={() => setModalCriar(false)}>
          <Form fields={FIELDS} onSubmit={handleCriar} onCancel={() => setModalCriar(false)} submitLabel="Cadastrar" />
        </Modal>
      )}

      {editando && (
        <Modal title={`Editar — ${editando.nome}`} onClose={() => setEditando(null)}>
          <Form fields={FIELDS} initialValues={{ nome:editando.nome, cnpj:editando.cnpj }}
            onSubmit={handleEditar} onCancel={() => setEditando(null)} submitLabel="Salvar" />
        </Modal>
      )}

      {deletando && (
        <Modal title="Confirmar Desativação" onClose={() => setDeletando(null)} width={420}>
          <p style={{ fontSize:14, color:"var(--text2)", marginBottom:20 }}>
            Deseja desativar <strong>{deletando.nome}</strong>? Todos os dados serão preservados.
          </p>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button className="btn btn-ghost" onClick={() => setDeletando(null)}>Cancelar</button>
            <button className="btn btn-danger" onClick={handleDeletar}>Desativar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
