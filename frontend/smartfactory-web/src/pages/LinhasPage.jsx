// src/pages/LinhasPage.jsx
import { useState } from "react";
import Table from "../components/Table";
import Form from "../components/Form";
import { PageHeader, Feedback, Modal } from "../components/UI";
import { empresasAPI, linhasAPI } from "../services/api";
import { useApi } from "../hooks/useApi";

const EMPRESA_ID = 1;

const FIELDS_CRIAR = [
  { name: "nome", label: "Nome da Linha", placeholder: "Ex: Linha 01", required: true },
];

export default function LinhasPage() {
  const { data: empresa }              = useApi(() => empresasAPI.obter(EMPRESA_ID));
  const { data: linhas, loading, refetch } = useApi(() => linhasAPI.listar(EMPRESA_ID));

  const [feedback,   setFeedback]   = useState(null);
  const [modalCriar, setModalCriar] = useState(false);
  const [editando,   setEditando]   = useState(null); // objeto linha
  const [deletando,  setDeletando]  = useState(null); // objeto linha

  const fb = (tipo, msg) => { setFeedback({ tipo, msg }); setTimeout(() => setFeedback(null), 4000); };

  // ── Criar ──
  const handleCriar = async (values) => {
    if (!values.nome.trim()) return fb("erro", "Nome é obrigatório.");
    try {
      await linhasAPI.criar(EMPRESA_ID, { nome: values.nome });
      fb("ok", `Linha "${values.nome}" criada com sucesso!`);
      setModalCriar(false);
      refetch();
    } catch (e) { fb("erro", e.message); }
  };

  // ── Editar ──
  const handleEditar = async (values) => {
    try {
      await linhasAPI.atualizar(EMPRESA_ID, editando.id, { nome: values.nome });
      fb("ok", `Linha renomeada para "${values.nome}".`);
      setEditando(null);
      refetch();
    } catch (e) { fb("erro", e.message); }
  };

  // ── Deletar ──
  const handleDeletar = async () => {
    try {
      await linhasAPI.deletar(EMPRESA_ID, deletando.id);
      fb("ok", `Linha "${deletando.nome}" desativada.`);
      setDeletando(null);
      refetch();
    } catch (e) { fb("erro", e.message); }
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <PageHeader
        title="Linhas de Produção"
        sub={empresa ? `EMPRESA: ${empresa.nome}` : "CARREGANDO..."}
        action={
          <button className="btn btn-solid" onClick={() => setModalCriar(true)}>+ Nova Linha</button>
        }
      />

      <Feedback {...(feedback ?? {})} onClose={() => setFeedback(null)} />

      <div className="sf-card">
        <div className="sf-card-header">
          <span className="sf-card-title">Linhas Cadastradas</span>
          {loading && <span className="badge badge-info">Carregando...</span>}
        </div>
        <Table
          data={linhas ?? []}
          emptyMessage="Nenhuma linha cadastrada. Crie a primeira linha acima."
          columns={[
            { key:"id",        label:"ID",       render: v => <span style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--text3)" }}>#{v}</span> },
            { key:"nome",      label:"Linha"     },
            { key:"criado_em", label:"Criado em", render: v => new Date(v).toLocaleDateString("pt-BR") },
            {
              key:"_acoes", label:"Ações",
              render: (_, row) => (
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
        <Modal title="Nova Linha de Produção" onClose={() => setModalCriar(false)}>
          <Form fields={FIELDS_CRIAR} onSubmit={handleCriar} onCancel={() => setModalCriar(false)} submitLabel="Criar Linha" />
        </Modal>
      )}

      {/* Modal Editar */}
      {editando && (
        <Modal title={`Editar — ${editando.nome}`} onClose={() => setEditando(null)}>
          <Form
            fields={FIELDS_CRIAR}
            initialValues={{ nome: editando.nome }}
            onSubmit={handleEditar}
            onCancel={() => setEditando(null)}
            submitLabel="Salvar Alteração"
          />
        </Modal>
      )}

      {/* Modal Confirmar Delete */}
      {deletando && (
        <Modal title="Confirmar Desativação" onClose={() => setDeletando(null)} width={420}>
          <p style={{ fontSize:14, color:"var(--text2)", marginBottom:20 }}>
            Deseja desativar a linha <strong>{deletando.nome}</strong>?
            As máquinas vinculadas serão preservadas mas a linha não aparecerá mais nas listagens.
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
