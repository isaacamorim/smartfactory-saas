// src/components/EmpresaSelector.jsx
// Componente reutilizável para selecionar empresa com busca por texto
// - Admin: vê todas, pode filtrar pelo nome
// - Gerente/Operador: empresa já é fixa (não exibe seletor)

import { useState, useEffect, useRef } from "react";
import { empresasAPI } from "../services/api";

export default function EmpresaSelector({ usuario, onSelect, empresaAtual }) {
    const [empresas,    setEmpresas]    = useState([]);
    const [busca,       setBusca]       = useState("");
    const [aberto,      setAberto]      = useState(false);
    const [selecionada, setSelecionada] = useState(empresaAtual ?? null);
    const [loading,     setLoading]     = useState(false);
    const ref = useRef(null);

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setAberto(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Carregar empresas (só admin precisa)
    useEffect(() => {
        if (usuario?.role !== "admin") return;
        setLoading(true);
        empresasAPI.listar()
            .then(setEmpresas)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [usuario]);

    // Gerente: empresa fixa, notifica automaticamente
    useEffect(() => {
        if (usuario?.role !== "admin" && usuario?.empresa_id) {
            empresasAPI.obter(usuario.empresa_id)
                .then(emp => { setSelecionada(emp); onSelect(emp); })
                .catch(() => {});
        }
    }, [usuario]);

    // Filtro por nome ou CNPJ
    const filtradas = empresas.filter(e =>
        e.nome.toLowerCase().includes(busca.toLowerCase()) ||
        e.cnpj.includes(busca)
    );

    const handleSelect = (emp) => {
        setSelecionada(emp);
        setBusca("");
        setAberto(false);
        onSelect(emp);
    };

    // Gerente: exibe só o nome, sem interação
    if (usuario?.role !== "admin") {
        return selecionada ? (
            <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px",
                background: "var(--primary-soft)",
                border: "1px solid var(--primary)",
                borderRadius: 6,
            }}>
                <span style={{ fontSize: 14, color: "var(--primary)" }}>🏭</span>
                <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{selecionada.nome}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text3)" }}>
                        {selecionada.cnpj}
                    </div>
                </div>
                <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 9,
                    color: "var(--primary)", background: "white", padding: "2px 8px",
                    border: "1px solid var(--primary)", borderRadius: 99 }}>
                    SUA EMPRESA
                </span>
            </div>
        ) : (
            <div style={{ padding: "10px 14px", background: "var(--bg1)", border: "1px solid var(--border)",
                borderRadius: 6, fontSize: 12, color: "var(--text3)" }}>
                Carregando empresa...
            </div>
        );
    }

    // Admin: dropdown com busca
    return (
        <div ref={ref} style={{ position: "relative" }}>
            {/* Campo de busca / trigger */}
            <div
                onClick={() => setAberto(a => !a)}
                style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px", cursor: "pointer",
                    border: `1px solid ${aberto ? "var(--primary)" : selecionada ? "var(--border2)" : "var(--border2)"}`,
                    borderRadius: 6, background: "var(--bg0)",
                    boxShadow: aberto ? "0 0 0 3px var(--primary-soft)" : "none",
                    transition: "all .15s",
                }}
            >
                <span style={{ fontSize: 14 }}>🏭</span>
                {selecionada ? (
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{selecionada.nome}</div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text3)" }}>{selecionada.cnpj}</div>
                    </div>
                ) : (
                    <span style={{ flex: 1, fontSize: 13, color: "var(--text3)" }}>
                        {loading ? "Carregando..." : "Selecione uma empresa..."}
                    </span>
                )}
                <span style={{ color: "var(--text3)", fontSize: 10 }}>{aberto ? "▲" : "▼"}</span>
            </div>

            {/* Dropdown */}
            {aberto && (
                <div style={{
                    position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
                    background: "#fff", border: "1px solid var(--border2)", borderRadius: 8,
                    boxShadow: "0 8px 24px rgba(0,0,0,.12)", zIndex: 200,
                    maxHeight: 320, display: "flex", flexDirection: "column",
                    animation: "slideUp .15s ease both",
                }}>
                    {/* Campo de busca dentro do dropdown */}
                    <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
                        <input
                            className="sf-input"
                            autoFocus
                            placeholder="Buscar por nome ou CNPJ..."
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                            onClick={e => e.stopPropagation()}
                            style={{ fontSize: 13 }}
                        />
                    </div>

                    {/* Lista */}
                    <div style={{ overflowY: "auto", maxHeight: 240 }}>
                        {filtradas.length === 0 ? (
                            <div style={{ padding: "16px", textAlign: "center", fontSize: 13, color: "var(--text3)" }}>
                                {busca ? `Nenhuma empresa encontrada para "${busca}"` : "Nenhuma empresa cadastrada"}
                            </div>
                        ) : (
                            filtradas.map(emp => (
                                <div
                                    key={emp.id}
                                    onClick={() => handleSelect(emp)}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 10,
                                        padding: "10px 14px", cursor: "pointer",
                                        background: selecionada?.id === emp.id ? "var(--primary-soft)" : "transparent",
                                        borderLeft: selecionada?.id === emp.id ? "3px solid var(--primary)" : "3px solid transparent",
                                        transition: "background .1s",
                                    }}
                                    onMouseEnter={e => { if (selecionada?.id !== emp.id) e.currentTarget.style.background = "var(--bg1)"; }}
                                    onMouseLeave={e => { if (selecionada?.id !== emp.id) e.currentTarget.style.background = "transparent"; }}
                                >
                                    <div style={{
                                        width: 32, height: 32, borderRadius: 6,
                                        background: selecionada?.id === emp.id ? "var(--primary)" : "var(--bg2)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontFamily: "var(--font-display)", fontSize: 11, fontWeight: 700,
                                        color: selecionada?.id === emp.id ? "#fff" : "var(--text2)",
                                        flexShrink: 0,
                                    }}>
                                        {emp.nome.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)",
                                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {emp.nome}
                                        </div>
                                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text3)" }}>
                                            {emp.cnpj}
                                        </div>
                                    </div>
                                    {selecionada?.id === emp.id && (
                                        <span style={{ color: "var(--primary)", fontSize: 14 }}>✓</span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer com contagem */}
                    <div style={{ padding: "8px 14px", borderTop: "1px solid var(--border)",
                        fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-mono)" }}>
                        {filtradas.length} de {empresas.length} empresa{empresas.length !== 1 ? "s" : ""}
                    </div>
                </div>
            )}
        </div>
    );
}
