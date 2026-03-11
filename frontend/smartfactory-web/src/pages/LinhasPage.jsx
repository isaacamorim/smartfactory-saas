// src/pages/LinhasPage.jsx
import { useState } from "react";
import Table from "../components/Table";
import Form from "../components/Form";
import EmpresaSelector from "../components/EmpresaSelector";
import { PageHeader, Feedback, Modal } from "../components/UI";
import { linhasAPI } from "../services/api";
import { useApi } from "../hooks/useApi";

const FIELDS_LINHA = [
    { name: "nome", label: "Nome da Linha", placeholder: "Ex: Linha 01 · Embalagem", required: true, full: true },
];

export default function LinhasPage({ auth }) {
    const [empresa,    setEmpresa]    = useState(null);  // empresa selecionada
    const [feedback,   setFeedback]   = useState(null);
    const [modalCriar, setModalCriar] = useState(false);
    const [editando,   setEditando]   = useState(null);
    const [deletando,  setDeletando]  = useState(null);

    // Carrega linhas apenas quando tiver empresa selecionada
    const { data: linhas, loading, refetch } = useApi(
        () => empresa ? linhasAPI.listar(empresa.id) : Promise.resolve([]),
        [empresa?.id]
    );

    const fb = (tipo, msg) => { setFeedback({ tipo, msg }); setTimeout(() => setFeedback(null), 4500); };

    const handleCriar = async (values) => {
        if (!empresa)            return fb("erro", "Selecione uma empresa primeiro.");
        if (!values.nome?.trim()) return fb("erro", "Nome da linha é obrigatório.");
        try {
            await linhasAPI.criar(empresa.id, { nome: values.nome.trim() });
            fb("ok", `Linha "${values.nome}" criada em ${empresa.nome}!`);
            setModalCriar(false);
            refetch();
        } catch (e) { fb("erro", e.message); }
    };

    const handleEditar = async (values) => {
        try {
            await linhasAPI.atualizar(empresa.id, editando.id, { nome: values.nome.trim() });
            fb("ok", `Linha renomeada para "${values.nome}".`);
            setEditando(null);
            refetch();
        } catch (e) { fb("erro", e.message); }
    };

    const handleDeletar = async () => {
        try {
            await linhasAPI.deletar(empresa.id, deletando.id);
            fb("ok", `Linha "${deletando.nome}" desativada.`);
            setDeletando(null);
            refetch();
        } catch (e) { fb("erro", e.message); }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <PageHeader
                title="Linhas de Produção"
                sub="GESTÃO DE LINHAS POR EMPRESA"
                action={
                    empresa && (
                        <button className="btn btn-solid" onClick={() => setModalCriar(true)}>
                            + Nova Linha
                        </button>
                    )
                }
            />

            <Feedback {...(feedback ?? {})} onClose={() => setFeedback(null)} />

            {/* Seletor de empresa */}
            <div className="sf-card" style={{ padding: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)",
                    textTransform: "uppercase", letterSpacing: .5, marginBottom: 10 }}>
                    Empresa
                </div>
                <EmpresaSelector
                    usuario={auth.usuario}
                    onSelect={setEmpresa}
                    empresaAtual={empresa}
                />
            </div>

            {/* Tabela de linhas */}
            {empresa ? (
                <div className="sf-card">
                    <div className="sf-card-header">
                        <span className="sf-card-title">Linhas — {empresa.nome}</span>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            {loading && <span className="badge badge-info">Carregando...</span>}
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11,
                                color: "var(--text3)" }}>{linhas?.length ?? 0} linha(s)</span>
                        </div>
                    </div>
                    <Table
                        data={linhas ?? []}
                        emptyMessage={`Nenhuma linha cadastrada para ${empresa.nome}. Crie a primeira acima.`}
                        columns={[
                            { key: "id",        label: "ID",
                                render: v => <span style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--text3)" }}>#{v}</span> },
                            { key: "nome",      label: "Nome da Linha" },
                            { key: "criado_em", label: "Criado em",
                                render: v => new Date(v).toLocaleDateString("pt-BR") },
                            {
                                key: "_acoes", label: "Ações",
                                render: (_, row) => (
                                    <div style={{ display:"flex", gap:6 }} onClick={e => e.stopPropagation()}>
                                        <button className="btn btn-icon" title="Editar"
                                            onClick={() => setEditando(row)}>✎</button>
                                        <button className="btn btn-icon danger" title="Desativar"
                                            onClick={() => setDeletando(row)}>✕</button>
                                    </div>
                                )
                            },
                        ]}
                    />
                </div>
            ) : (
                <div className="sf-card" style={{ padding: "40px 24px", textAlign: "center" }}>
                    <div style={{ fontSize: 32, marginBottom: 12, opacity: .2 }}>—</div>
                    <div style={{ fontSize: 13, color: "var(--text3)" }}>
                        Selecione uma empresa acima para ver e gerenciar suas linhas.
                    </div>
                </div>
            )}

            {/* Modal Criar */}
            {modalCriar && (
                <Modal title={`Nova Linha — ${empresa?.nome}`} onClose={() => setModalCriar(false)}>
                    <Form fields={FIELDS_LINHA} onSubmit={handleCriar}
                        onCancel={() => setModalCriar(false)} submitLabel="Criar Linha" />
                </Modal>
            )}

            {/* Modal Editar */}
            {editando && (
                <Modal title={`Editar — ${editando.nome}`} onClose={() => setEditando(null)}>
                    <Form fields={FIELDS_LINHA} initialValues={{ nome: editando.nome }}
                        onSubmit={handleEditar} onCancel={() => setEditando(null)} submitLabel="Salvar" />
                </Modal>
            )}

            {/* Modal Confirmar Desativação */}
            {deletando && (
                <Modal title="Confirmar Desativação" onClose={() => setDeletando(null)} width={420}>
                    <p style={{ fontSize:14, color:"var(--text2)", marginBottom:20, lineHeight:1.6 }}>
                        Deseja desativar a linha <strong>{deletando.nome}</strong> de{" "}
                        <strong>{empresa?.nome}</strong>?<br />
                        <span style={{ fontSize:12, color:"var(--text3)" }}>
                            As máquinas vinculadas são preservadas, mas a linha não aparecerá mais nas listagens.
                        </span>
                    </p>
                    <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
                        <button className="btn btn-ghost" onClick={() => setDeletando(null)}>Cancelar</button>
                        <button className="btn btn-danger" onClick={handleDeletar}>Desativar Linha</button>
                    </div>
                </Modal>
            )}
        </div>
    );
}
