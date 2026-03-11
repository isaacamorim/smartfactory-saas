// src/pages/UsuariosPage.jsx
import { useState } from "react";
import Table from "../components/Table";
import Form from "../components/Form";
import { PageHeader, Feedback, Modal } from "../components/UI";
import { usuariosAPI } from "../services/api";
import { useApi } from "../hooks/useApi";

const EMPRESA_ID = 1;

const ROLES = [
  { value:"admin",    label:"Administrador" },
  { value:"gerente",  label:"Gerente"       },
  { value:"operador", label:"Operador"      },
];

const ROLE_COLORS = { admin:"var(--primary)", gerente:"var(--info)", operador:"var(--green)" };

const FIELDS_CRIAR = [
  { name:"nome",  label:"Nome completo",  placeholder:"João Silva",        required:true },
  { name:"email", label:"E-mail",         placeholder:"joao@empresa.com",  required:true },
  { name:"senha", label:"Senha",          type:"password", placeholder:"mínimo 6 caracteres", required:true },
  { name:"role",  label:"Perfil de acesso", type:"select", options:ROLES },
];

const FIELDS_EDITAR = [
  { name:"nome", label:"Nome completo", placeholder:"João Silva", required:true },
  { name:"role", label:"Perfil de acesso", type:"select", options:ROLES },
];

export default function UsuariosPage() {
  const { data: usuarios, loading, refetch } = useApi(() => usuariosAPI.listar(EMPRESA_ID));

  const [feedback,   setFeedback]   = useState(null);
  const [modalCriar, setModalCriar] = useState(false);
  const [editando,   setEditando]   = useState(null);
  const [deletando,  setDeletando]  = useState(null);

  const fb = (tipo, msg) => { setFeedback({ tipo, msg }); setTimeout(() => setFeedback(null), 4000); };

  const handleCriar = async (values) => {
    if (!values.nome || !values.email) return fb("erro", "Nome e e-mail são obrigatórios.");
    try {
      await usuariosAPI.criar({ ...values, empresa_id: EMPRESA_ID });
      fb("ok", `Usuário "${values.nome}" criado com sucesso!`);
      setModalCriar(false);
      refetch();
    } catch (e) { fb("erro", e.message); }
  };

  const handleEditar = async (values) => {
    try {
      await usuariosAPI.atualizar(editando.id, { nome: values.nome, role: values.role });
      fb("ok", `Usuário "${values.nome}" atualizado.`);
      setEditando(null);
      refetch();
    } catch (e) { fb("erro", e.message); }
  };

  const handleDeletar = async () => {
    try {
      await usuariosAPI.deletar(deletando.id);
      fb("ok", `Usuário "${deletando.nome}" desativado.`);
      setDeletando(null);
      refetch();
    } catch (e) { fb("erro", e.message); }
  };

  const total   = usuarios?.length ?? 0;
  const admins  = usuarios?.filter(u => u.role === "admin").length   ?? 0;
  const gerentes = usuarios?.filter(u => u.role === "gerente").length ?? 0;
  const operadores = usuarios?.filter(u => u.role === "operador").length ?? 0;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <PageHeader
        title="Usuários"
        sub="CONTROLE DE ACESSO"
        action={<button className="btn btn-solid" onClick={() => setModalCriar(true)}>+ Novo Usuário</button>}
      />

      <Feedback {...(feedback ?? {})} onClose={() => setFeedback(null)} />

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        {[
          ["Total",        total,      "var(--text)"],
          ["Administradores", admins,   "var(--primary)"],
          ["Gerentes",     gerentes,   "var(--info)"],
          ["Operadores",   operadores, "var(--green)"],
        ].map(([l,v,c]) => (
          <div key={l} className="sf-card" style={{ padding:16 }}>
            <div style={{ fontSize:11, fontWeight:600, color:"var(--text3)", textTransform:"uppercase", marginBottom:8 }}>{l}</div>
            <div style={{ fontFamily:"var(--font-display)", fontSize:32, fontWeight:800, color:c }}>{v}</div>
          </div>
        ))}
      </div>

      <div className="sf-card">
        <div className="sf-card-header">
          <span className="sf-card-title">Usuários Cadastrados</span>
          {loading && <span className="badge badge-info">Carregando...</span>}
        </div>
        <Table
          data={usuarios ?? []}
          emptyMessage="Nenhum usuário cadastrado."
          columns={[
            { key:"nome",       label:"Nome"    },
            { key:"email",      label:"E-mail",  render: v => <span style={{ fontFamily:"var(--font-mono)", fontSize:11 }}>{v}</span> },
            { key:"role",       label:"Perfil",  render: v => (
              <span className="chip" style={{
                color: ROLE_COLORS[v], background: ROLE_COLORS[v]+"18",
                border:`1px solid ${ROLE_COLORS[v]}44`,
              }}>
                <span style={{ background:ROLE_COLORS[v] }} /> {v}
              </span>
            )},
            { key:"criado_em",  label:"Cadastro", render: v => new Date(v).toLocaleDateString("pt-BR") },
            {
              key:"_acoes", label:"Ações",
              render: (_,row) => (
                <div style={{ display:"flex", gap:6 }} onClick={e => e.stopPropagation()}>
                  <button className="btn btn-icon" title="Editar" onClick={() => setEditando(row)}>✎</button>
                  <button className="btn btn-icon danger" title="Desativar" onClick={() => setDeletando(row)}>✕</button>
                </div>
              )
            },
          ]}
        />
      </div>

      {/* Modal Criar */}
      {modalCriar && (
        <Modal title="Novo Usuário" onClose={() => setModalCriar(false)}>
          <Form fields={FIELDS_CRIAR} onSubmit={handleCriar} onCancel={() => setModalCriar(false)} submitLabel="Criar Usuário" />
        </Modal>
      )}

      {/* Modal Editar */}
      {editando && (
        <Modal title={`Editar — ${editando.nome}`} onClose={() => setEditando(null)}>
          <Form
            fields={FIELDS_EDITAR}
            initialValues={{ nome: editando.nome, role: editando.role }}
            onSubmit={handleEditar}
            onCancel={() => setEditando(null)}
            submitLabel="Salvar"
          />
        </Modal>
      )}

      {/* Modal Delete */}
      {deletando && (
        <Modal title="Confirmar Desativação" onClose={() => setDeletando(null)} width={420}>
          <p style={{ fontSize:14, color:"var(--text2)", marginBottom:20 }}>
            Deseja desativar o usuário <strong>{deletando.nome}</strong> ({deletando.email})?
            O acesso será revogado imediatamente.
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
