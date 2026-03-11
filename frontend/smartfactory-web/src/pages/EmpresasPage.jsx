// src/pages/EmpresasPage.jsx
import { useState } from "react";
import Table from "../components/Table";
import Form from "../components/Form";
import { PageHeader, StatCard } from "../components/UI";
import { empresasAPI } from "../services/api";
import { useApi } from "../hooks/useApi";

const FORM_CRIAR = [
    { name: "nome", label: "Razão Social", placeholder: "Nome da empresa" },
    { name: "cnpj", label: "CNPJ",         placeholder: "00.000.000/0001-00" },
];

export default function EmpresasPage() {
    const { data: empresas, loading, error, refetch } = useApi(() => empresasAPI.listar());
    const [showForm, setShowForm] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const handleCriar = async (values) => {
        try {
            await empresasAPI.criar(values);
            setFeedback({ tipo: "ok", msg: `Empresa "${values.nome}" cadastrada!` });
            setShowForm(false);
            refetch();
        } catch (e) {
            setFeedback({ tipo: "erro", msg: e.message });
        }
    };

    const handleDeletar = async (empresa) => {
        if (!confirm(`Desativar empresa "${empresa.nome}"?`)) return;
        try {
            await empresasAPI.deletar(empresa.id);
            setFeedback({ tipo: "ok", msg: `Empresa "${empresa.nome}" desativada.` });
            refetch();
        } catch (e) {
            setFeedback({ tipo: "erro", msg: e.message });
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <PageHeader
                title="Empresas"
                sub="GESTÃO MULTIEMPRESA"
                action={
                    <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
                        {showForm ? "CANCELAR" : "+ NOVA EMPRESA"}
                    </button>
                }
            />

            {/* Feedback */}
            {feedback && (
                <div style={{
                    padding: "12px 16px",
                    background: feedback.tipo === "ok" ? "rgba(0,200,83,.1)" : "rgba(255,61,61,.1)",
                    border: `1px solid ${feedback.tipo === "ok" ? "var(--green)" : "var(--red)"}`,
                    color: feedback.tipo === "ok" ? "var(--green)" : "var(--red)",
                    fontFamily: "var(--font-mono)", fontSize: 12,
                    display: "flex", justifyContent: "space-between",
                }}>
                    {feedback.msg}
                    <span style={{ cursor: "pointer" }} onClick={() => setFeedback(null)}>✕</span>
                </div>
            )}

            {/* KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                <StatCard label="Empresas Ativas" value={empresas?.length ?? "—"} accent="var(--primary)" />
                <StatCard label="Carregando"       value={loading ? "..." : "OK"} accent="var(--green)"   />
                <StatCard label="Erros"            value={error   ? "!" : "0"}    accent={error ? "var(--red)" : "var(--green)"} />
            </div>

            {/* Form */}
            {showForm && (
                <div className="animate-up">
                    <Form
                        title="Cadastrar Nova Empresa"
                        fields={FORM_CRIAR}
                        onSubmit={handleCriar}
                        onCancel={() => setShowForm(false)}
                    />
                </div>
            )}

            {/* Tabela */}
            <div className="sf-card">
                <div className="sf-card-header">
                    <span className="sf-card-title">Empresas Cadastradas</span>
                    {loading && <span className="badge badge-info">CARREGANDO...</span>}
                </div>
                <Table
                    data={empresas ?? []}
                    emptyMessage={error ? `Erro: ${error}` : "Nenhuma empresa cadastrada"}
                    columns={[
                        { key: "id",        label: "ID",          render: v => <span style={{ fontFamily: "var(--font-mono)", color: "var(--text3)" }}>#{v}</span> },
                        { key: "nome",      label: "Razão Social" },
                        { key: "cnpj",      label: "CNPJ",        render: v => <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{v}</span> },
                        { key: "criado_em", label: "Criado em",   render: v => new Date(v).toLocaleDateString("pt-BR") },
                        {
                            key: "id", label: "Ações",
                            render: (v, row) => (
                                <button
                                    className="btn btn-danger"
                                    style={{ padding: "4px 12px", fontSize: 10 }}
                                    onClick={(e) => { e.stopPropagation(); handleDeletar(row); }}
                                >
                                    DESATIVAR
                                </button>
                            )
                        },
                    ]}
                />
            </div>
        </div>
    );
}
