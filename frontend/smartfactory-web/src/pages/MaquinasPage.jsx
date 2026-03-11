// src/pages/MaquinasPage.jsx
import { useState } from "react";
import Table from "../components/Table";
import Form from "../components/Form";
import { OEEMiniBar, PageHeader } from "../components/UI";
import { empresasAPI, linhasAPI, maquinasAPI } from "../services/api";
import { useApi } from "../hooks/useApi";

// ID da empresa logada — futuramente vem do contexto de auth
const EMPRESA_ID = 1;

export default function MaquinasPage() {
    const { data: empresaData } = useApi(() => empresasAPI.obterCompleto(EMPRESA_ID));
    const { data: maquinas, loading, refetch } = useApi(() => maquinasAPI.listarPorEmpresa(EMPRESA_ID));
    const [showForm, setShowForm] = useState(false);
    const [feedback, setFeedback] = useState(null);

    // Opções de linha para o formulário
    const linhaOptions = empresaData?.linhas?.map(l => ({ value: l.id, label: l.nome })) ?? [];

    const FORM_FIELDS = [
        {
            name: "linha_id", label: "Linha", type: "select",
            options: linhaOptions.length ? linhaOptions : [{ value: "", label: "— cadastre uma linha primeiro —" }]
        },
        { name: "serial_number", label: "Serial Number", placeholder: "EVA1000-00045" },
        { name: "modelo",        label: "Modelo",        placeholder: "EVA1000" },
    ];

    const handleCriar = async (values) => {
        try {
            await maquinasAPI.criar({ ...values, linha_id: Number(values.linha_id) });
            setFeedback({ tipo: "ok", msg: `Máquina ${values.serial_number} cadastrada!` });
            setShowForm(false);
            refetch();
        } catch (e) {
            setFeedback({ tipo: "erro", msg: e.message });
        }
    };

    const handleDeletar = async (maquina) => {
        if (!confirm(`Desativar máquina "${maquina.serial_number}"?`)) return;
        try {
            await maquinasAPI.deletar(maquina.id);
            setFeedback({ tipo: "ok", msg: `Máquina ${maquina.serial_number} desativada.` });
            refetch();
        } catch (e) {
            setFeedback({ tipo: "erro", msg: e.message });
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <PageHeader
                title="Máquinas"
                sub="GERENCIAMENTO DE EQUIPAMENTOS"
                action={
                    <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
                        {showForm ? "CANCELAR" : "+ CADASTRAR MÁQUINA"}
                    </button>
                }
            />

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

            {/* Hierarquia visual: Empresa → Linhas → Máquinas */}
            {empresaData && (
                <div className="sf-card">
                    <div className="sf-card-header">
                        <span className="sf-card-title">Estrutura — {empresaData.nome}</span>
                    </div>
                    <div className="sf-card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {(empresaData.linhas ?? []).map(linha => (
                            <div key={linha.id} style={{
                                border: "1px solid var(--border)",
                                borderLeft: "3px solid var(--primary)",
                            }}>
                                <div style={{
                                    background: "var(--bg1)", padding: "8px 14px",
                                    fontFamily: "var(--font-display)", fontSize: 13,
                                    fontWeight: 700, letterSpacing: 1, color: "var(--text)",
                                    borderBottom: "1px solid var(--border)",
                                }}>
                                    ≋ {linha.nome}
                                </div>
                                <div style={{ padding: "8px 14px", display: "flex", flexWrap: "wrap", gap: 8 }}>
                                    {(linha.maquinas ?? []).length === 0 ? (
                                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text3)" }}>
                                            Nenhuma máquina nesta linha
                                        </span>
                                    ) : (
                                        linha.maquinas.map(m => (
                                            <div key={m.id} style={{
                                                border: "1px solid var(--border2)",
                                                padding: "6px 12px", fontSize: 12,
                                                fontFamily: "var(--font-mono)", color: "var(--primary)",
                                            }}>
                                                {m.serial_number} · {m.modelo}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showForm && (
                <div className="animate-up">
                    <Form
                        title="Cadastrar Nova Máquina"
                        fields={FORM_FIELDS}
                        onSubmit={handleCriar}
                        onCancel={() => setShowForm(false)}
                    />
                </div>
            )}

            <div className="sf-card">
                <div className="sf-card-header">
                    <span className="sf-card-title">Todas as Máquinas</span>
                    {loading && <span className="badge badge-info">CARREGANDO...</span>}
                </div>
                <Table
                    data={maquinas ?? []}
                    emptyMessage="Nenhuma máquina cadastrada"
                    columns={[
                        { key: "serial_number", label: "Serial",   render: v => <span className="serial">{v}</span> },
                        { key: "modelo",        label: "Modelo"   },
                        { key: "linha_id",      label: "Linha",    render: v => {
                            const l = empresaData?.linhas?.find(l => l.id === v);
                            return l?.nome ?? `Linha #${v}`;
                        }},
                        { key: "criado_em",     label: "Cadastro", render: v => new Date(v).toLocaleDateString("pt-BR") },
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
