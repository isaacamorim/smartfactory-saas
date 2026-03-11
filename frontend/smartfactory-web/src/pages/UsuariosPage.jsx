// src/pages/UsuariosPage.jsx
import { useState } from "react";
import Table from "../components/Table";
import Form from "../components/Form";
import EmpresaSelector from "../components/EmpresaSelector";
import { PageHeader, Feedback, Modal } from "../components/UI";
import { usuariosAPI } from "../services/api";
import { useApi } from "../hooks/useApi";

const ROLE_COLORS = { admin:"var(--primary)", gerente:"var(--info)", operador:"var(--green)" };
const ROLE_LABELS = { admin:"Administrador", gerente:"Gerente", operador:"Operador" };

// Roles que cada nível pode criar
function getRolesDisponiveis(role) {
    if (role === "admin")   return [
        { value:"gerente",  label:"Gerente"   },
        { value:"operador", label:"Operador"  },
    ];
    // gerente só cria operador
    return [{ value:"operador", label:"Operador" }];
}

export default function UsuariosPage({ auth }) {
    const [empresa,    setEmpresa]    = useState(null);
    const [feedback,   setFeedback]   = useState(null);
    const [modalCriar, setModalCriar] = useState(false);
    const [editando,   setEditando]   = useState(null);
    const [deletando,  setDeletando]  = useState(null);

    const { data: usuarios, loading, refetch } = useApi(
        () => empresa ? usuariosAPI.listar(empresa.id) : Promise.resolve([]),
        [empresa?.id]
    );

    const fb = (tipo, msg) => { setFeedback({ tipo, msg }); setTimeout(() => setFeedback(null), 4500); };

    const rolesDisponiveis = getRolesDisponiveis(auth.usuario?.role);

    const fieldsFormCriar = [
        { name:"nome",  label:"Nome completo",    placeholder:"João Silva",       required:true },
        { name:"email", label:"E-mail",            placeholder:"joao@empresa.com", required:true },
        { name:"senha", label:"Senha",             type:"password", placeholder:"mínimo 6 caracteres", required:true },
        { name:"role",  label:"Perfil de acesso",  type:"select", options:rolesDisponiveis },
    ];

    const fieldsFormEditar = [
        { name:"nome", label:"Nome completo", placeholder:"João Silva", required:true },
        { name:"role", label:"Perfil de acesso", type:"select", options:rolesDisponiveis },
    ];

    const handleCriar = async (values) => {
        if (!empresa)              return fb("erro", "Selecione uma empresa primeiro.");
        if (!values.nome?.trim())  return fb("erro", "Nome é obrigatório.");
        if (!values.email?.trim()) return fb("erro", "E-mail é obrigatório.");
        if (!values.senha)         return fb("erro", "Senha é obrigatória.");
        try {
            await usuariosAPI.criar({
                nome:       values.nome.trim(),
                email:      values.email.trim().toLowerCase(),
                senha:      values.senha,
                role:       values.role || "operador",
                empresa_id: empresa.id,
            });
            fb("ok", `Usuário "${values.nome}" criado em ${empresa.nome}!`);
            setModalCriar(false);
            refetch();
        } catch (e) { fb("erro", e.message); }
    };

    const handleEditar = async (values) => {
        try {
            await usuariosAPI.atualizar(editando.id, {
                nome: values.nome.trim(),
                role: values.role,
            });
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

    // KPIs
    const total      = usuarios?.length ?? 0;
    const gerentes   = usuarios?.filter(u => u.role === "gerente").length  ?? 0;
    const operadores = usuarios?.filter(u => u.role === "operador").length ?? 0;

    return (
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            <PageHeader
                title="Usuários"
                sub="CONTROLE DE ACESSO POR EMPRESA"
                action={
                    empresa && (
                        <button className="btn btn-solid" onClick={() => setModalCriar(true)}>
                            + Novo Usuário
                        </button>
                    )
                }
            />

            <Feedback {...(feedback ?? {})} onClose={() => setFeedback(null)} />

            {/* Seletor de empresa */}
            <div className="sf-card" style={{ padding:20 }}>
                <div style={{ fontSize:11, fontWeight:600, color:"var(--text3)",
                    textTransform:"uppercase", letterSpacing:.5, marginBottom:10 }}>
                    Empresa
                </div>
                <EmpresaSelector
                    usuario={auth.usuario}
                    onSelect={setEmpresa}
                    empresaAtual={empresa}
                />
            </div>

            {empresa ? (
                <>
                    {/* KPIs */}
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
                        {[
                            ["Total de Usuários", total,      "var(--text)"],
                            ["Gerentes",          gerentes,   "var(--info)"],
                            ["Operadores",        operadores, "var(--green)"],
                        ].map(([l,v,c]) => (
                            <div key={l} className="sf-card" style={{ padding:16 }}>
                                <div style={{ fontSize:11, fontWeight:600, color:"var(--text3)",
                                    textTransform:"uppercase", marginBottom:8 }}>{l}</div>
                                <div style={{ fontFamily:"var(--font-display)", fontSize:32, fontWeight:800, color:c }}>{v}</div>
                            </div>
                        ))}
                    </div>

                    {/* Tabela */}
                    <div className="sf-card">
                        <div className="sf-card-header">
                            <span className="sf-card-title">Usuários — {empresa.nome}</span>
                            {loading && <span className="badge badge-info">Carregando...</span>}
                        </div>
                        <Table
                            data={usuarios ?? []}
                            emptyMessage={`Nenhum usuário em ${empresa.nome}. Crie o primeiro acima.`}
                            columns={[
                                { key:"nome",      label:"Nome"     },
                                { key:"email",     label:"E-mail",
                                    render: v => <span style={{ fontFamily:"var(--font-mono)", fontSize:11 }}>{v}</span> },
                                { key:"role",      label:"Perfil",
                                    render: v => (
                                        <span style={{
                                            display:"inline-flex", alignItems:"center", gap:5,
                                            fontFamily:"var(--font-mono)", fontSize:10, fontWeight:600,
                                            textTransform:"uppercase", padding:"3px 9px", borderRadius:20,
                                            color: ROLE_COLORS[v],
                                            background: ROLE_COLORS[v]+"18",
                                            border:`1px solid ${ROLE_COLORS[v]}44`,
                                        }}>
                                            <span style={{ width:5, height:5, borderRadius:"50%",
                                                background:ROLE_COLORS[v], display:"inline-block" }} />
                                            {ROLE_LABELS[v] ?? v}
                                        </span>
                                    )
                                },
                                { key:"criado_em", label:"Cadastro",
                                    render: v => new Date(v).toLocaleDateString("pt-BR") },
                                {
                                    key:"_acoes", label:"Ações",
                                    render:(_,row) => (
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
                </>
            ) : (
                <div className="sf-card" style={{ padding:"40px 24px", textAlign:"center" }}>
                    <div style={{ fontSize:32, marginBottom:12, opacity:.2 }}>◻</div>
                    <div style={{ fontSize:13, color:"var(--text3)" }}>
                        Selecione uma empresa acima para ver e gerenciar seus usuários.
                    </div>
                </div>
            )}

            {/* Modal Criar */}
            {modalCriar && (
                <Modal title={`Novo Usuário — ${empresa?.nome}`} onClose={() => setModalCriar(false)}>
                    <Form fields={fieldsFormCriar} onSubmit={handleCriar}
                        onCancel={() => setModalCriar(false)} submitLabel="Criar Usuário" />
                </Modal>
            )}

            {/* Modal Editar */}
            {editando && (
                <Modal title={`Editar — ${editando.nome}`} onClose={() => setEditando(null)}>
                    <Form
                        fields={fieldsFormEditar}
                        initialValues={{ nome:editando.nome, role:editando.role }}
                        onSubmit={handleEditar}
                        onCancel={() => setEditando(null)}
                        submitLabel="Salvar"
                    />
                </Modal>
            )}

            {/* Modal Delete */}
            {deletando && (
                <Modal title="Confirmar Desativação" onClose={() => setDeletando(null)} width={420}>
                    <p style={{ fontSize:14, color:"var(--text2)", marginBottom:20, lineHeight:1.6 }}>
                        Deseja desativar <strong>{deletando.nome}</strong>{" "}
                        ({deletando.email})?<br />
                        <span style={{ fontSize:12, color:"var(--text3)" }}>
                            O acesso será revogado imediatamente.
                        </span>
                    </p>
                    <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
                        <button className="btn btn-ghost" onClick={() => setDeletando(null)}>Cancelar</button>
                        <button className="btn btn-danger" onClick={handleDeletar}>Desativar Usuário</button>
                    </div>
                </Modal>
            )}
        </div>
    );
}
