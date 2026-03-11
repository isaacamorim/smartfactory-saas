// src/pages/MaquinasPage.jsx
import { useState } from "react";
import Table from "../components/Table";
import Form from "../components/Form";
import EmpresaSelector from "../components/EmpresaSelector";
import { PageHeader, Feedback, Modal } from "../components/UI";
import { linhasAPI, maquinasAPI } from "../services/api";
import { useApi } from "../hooks/useApi";

export default function MaquinasPage({ auth }) {
    const [empresa,    setEmpresa]    = useState(null);
    const [feedback,   setFeedback]   = useState(null);
    const [modalCriar, setModalCriar] = useState(false);
    const [editando,   setEditando]   = useState(null);
    const [deletando,  setDeletando]  = useState(null);

    const { data: maquinas, loading, refetch } = useApi(
        () => empresa ? maquinasAPI.listarPorEmpresa(empresa.id) : Promise.resolve([]),
        [empresa?.id]
    );
    const { data: linhas } = useApi(
        () => empresa ? linhasAPI.listar(empresa.id) : Promise.resolve([]),
        [empresa?.id]
    );

    const fb = (tipo, msg) => { setFeedback({ tipo, msg }); setTimeout(() => setFeedback(null), 4500); };

    const linhaOptions = (linhas ?? []).map(l => ({ value: l.id, label: l.nome }));

    const FIELDS_CRIAR = [
        { name:"linha_id",      label:"Linha",         type:"select", options:linhaOptions, required:true },
        { name:"serial_number", label:"Serial Number", placeholder:"EVA1000-00045", required:true },
        { name:"modelo",        label:"Modelo",        placeholder:"EVA1000",       required:true },
    ];

    const FIELDS_EDITAR = [
        { name:"linha_id", label:"Linha",  type:"select", options:linhaOptions },
        { name:"modelo",   label:"Modelo", placeholder:"EVA1000" },
    ];

    const handleCriar = async (values) => {
        if (!empresa) return fb("erro", "Selecione uma empresa primeiro.");
        try {
            await maquinasAPI.criar({ ...values, linha_id: Number(values.linha_id) });
            fb("ok", `Máquina ${values.serial_number} cadastrada!`);
            setModalCriar(false);
            refetch();
        } catch (e) { fb("erro", e.message); }
    };

    const handleEditar = async (values) => {
        try {
            await maquinasAPI.atualizar(editando.id, {
                linha_id: values.linha_id ? Number(values.linha_id) : undefined,
                modelo:   values.modelo || undefined,
            });
            fb("ok", `Máquina ${editando.serial_number} atualizada.`);
            setEditando(null);
            refetch();
        } catch (e) { fb("erro", e.message); }
    };

    const handleDeletar = async () => {
        try {
            await maquinasAPI.deletar(deletando.id);
            fb("ok", `Máquina ${deletando.serial_number} desativada.`);
            setDeletando(null);
            refetch();
        } catch (e) { fb("erro", e.message); }
    };

    const linhaNome = (id) => linhas?.find(l => l.id === id)?.nome ?? `#${id}`;

    return (
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            <PageHeader
                title="Máquinas"
                sub="EQUIPAMENTOS POR EMPRESA"
                action={
                    empresa && auth.isAdmin && (
                        <button className="btn btn-solid" onClick={() => setModalCriar(true)}>
                            + Cadastrar Máquina
                        </button>
                    )
                }
            />

            <Feedback {...(feedback ?? {})} onClose={() => setFeedback(null)} />

            <div className="sf-card" style={{ padding:20 }}>
                <div style={{ fontSize:11, fontWeight:600, color:"var(--text3)",
                    textTransform:"uppercase", letterSpacing:.5, marginBottom:10 }}>
                    Empresa
                </div>
                <EmpresaSelector usuario={auth.usuario} onSelect={setEmpresa} empresaAtual={empresa} />
            </div>

            {empresa ? (
                <div className="sf-card">
                    <div className="sf-card-header">
                        <span className="sf-card-title">Máquinas — {empresa.nome}</span>
                        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                            {loading && <span className="badge badge-info">Carregando...</span>}
                            <span style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--text3)" }}>
                                {maquinas?.length ?? 0} máquina(s)
                            </span>
                        </div>
                    </div>
                    <Table
                        data={maquinas ?? []}
                        emptyMessage={`Nenhuma máquina em ${empresa.nome}.`}
                        columns={[
                            { key:"serial_number", label:"Serial",
                                render: v => <span className="serial">{v}</span> },
                            { key:"modelo",   label:"Modelo" },
                            { key:"linha_id", label:"Linha",
                                render: v => linhaNome(v) },
                            { key:"criado_em", label:"Cadastro",
                                render: v => new Date(v).toLocaleDateString("pt-BR") },
                            {
                                key:"_acoes", label:"Ações",
                                render:(_,row) => (
                                    <div style={{ display:"flex", gap:6 }} onClick={e => e.stopPropagation()}>
                                        {/* Gerente pode trocar de linha */}
                                        <button className="btn btn-icon" title="Editar"
                                            onClick={() => setEditando(row)}>✎</button>
                                        {/* Só admin desativa */}
                                        {auth.isAdmin && (
                                            <button className="btn btn-icon danger" title="Desativar"
                                                onClick={() => setDeletando(row)}>✕</button>
                                        )}
                                    </div>
                                )
                            },
                        ]}
                    />
                </div>
            ) : (
                <div className="sf-card" style={{ padding:"40px 24px", textAlign:"center" }}>
                    <div style={{ fontSize:32, marginBottom:12, opacity:.2 }}>⬡</div>
                    <div style={{ fontSize:13, color:"var(--text3)" }}>
                        Selecione uma empresa acima para ver suas máquinas.
                    </div>
                </div>
            )}

            {modalCriar && (
                <Modal title={`Nova Máquina — ${empresa?.nome}`} onClose={() => setModalCriar(false)}>
                    {linhaOptions.length === 0 ? (
                        <div style={{ padding:"16px 0", fontSize:13, color:"var(--orange)" }}>
                            ⚠ Cadastre pelo menos uma linha antes de adicionar máquinas.
                        </div>
                    ) : (
                        <Form fields={FIELDS_CRIAR} onSubmit={handleCriar}
                            onCancel={() => setModalCriar(false)} submitLabel="Cadastrar" />
                    )}
                </Modal>
            )}

            {editando && (
                <Modal title={`Editar — ${editando.serial_number}`} onClose={() => setEditando(null)}>
                    <Form
                        fields={FIELDS_EDITAR}
                        initialValues={{ linha_id: editando.linha_id, modelo: editando.modelo }}
                        onSubmit={handleEditar}
                        onCancel={() => setEditando(null)}
                        submitLabel="Salvar"
                    />
                </Modal>
            )}

            {deletando && (
                <Modal title="Confirmar Desativação" onClose={() => setDeletando(null)} width={420}>
                    <p style={{ fontSize:14, color:"var(--text2)", marginBottom:20, lineHeight:1.6 }}>
                        Desativar a máquina <strong>{deletando.serial_number}</strong>?<br />
                        <span style={{ fontSize:12, color:"var(--text3)" }}>
                            Os dados históricos serão preservados no InfluxDB.
                        </span>
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
