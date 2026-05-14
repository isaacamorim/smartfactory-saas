// src/components/Sidebar.jsx
// Sidebar que minimiza/expande com clique — inspirado no sidebar do site NH
// Desktop: minimizado por padrão (72px), expande ao hover OU ao clicar na logo/seta
// Mobile: overlay deslizante

import { useState, useEffect } from "react";
import { NAV_ITEMS } from "../data/mockData";

const VISIBLE = {
    admin: ["dashboard", "oee", "maquinas", "linhas", "producao", "alarmes", "manutencao", "empresas", "usuarios", "metas", "parametros"],
    gerente: ["dashboard", "oee", "maquinas", "linhas", "producao", "alarmes", "manutencao", "usuarios", "metas", "parametros"],
    operador: ["dashboard", "oee", "producao", "alarmes"],
};

export default function Sidebar({ page, setPage, usuario }) {
    const role = usuario?.role ?? "operador";
    const visible = VISIBLE[role] ?? [];

    // pinned = usuário clicou para fixar expandido (como no site NH ao clicar na logo)
    const [pinned, setPinned] = useState(false);
    // hover = mouse está sobre o sidebar
    const [hovered, setHovered] = useState(false);
    // mobile open
    const [mobileOpen, setMobileOpen] = useState(false);

    const expanded = pinned || hovered;

    // Fechar mobile ao trocar de página
    useEffect(() => { setMobileOpen(false); }, [page]);

    const W_COLLAPSED = 72;
    const W_EXPANDED = 230;

    return (
        <>
            {/* ── Botão mobile ── */}
            <button
                onClick={() => setMobileOpen(o => !o)}
                style={{
                    display: "none",
                    position: "fixed", top: 10, left: 10, zIndex: 1100,
                    width: 36, height: 36, borderRadius: 8,
                    background: "#fff", border: "1px solid var(--border)",
                    boxShadow: "0 2px 8px rgba(0,0,0,.12)",
                    cursor: "pointer", fontSize: 16, alignItems: "center", justifyContent: "center",
                }}
                className="sidebar-mobile-btn"
            >☰</button>

            {/* ── Overlay mobile ── */}
            {mobileOpen && (
                <div
                    onClick={() => setMobileOpen(false)}
                    style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 900 }}
                />
            )}

            {/* ── Sidebar ── */}
            <aside
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                    width: expanded ? W_EXPANDED : W_COLLAPSED,
                    minWidth: expanded ? W_EXPANDED : W_COLLAPSED,
                    background: "#fff",
                    borderRight: "1px solid var(--border)",
                    boxShadow: expanded ? "4px 0 20px rgba(0,0,0,.08)" : "1px 0 4px rgba(0,0,0,.05)",
                    display: "flex", flexDirection: "column",
                    position: "relative", zIndex: 10,
                    transition: "width .25s ease, min-width .25s ease, box-shadow .25s ease",
                    overflow: "hidden",
                }}
            >
                {/* Faixa vermelha topo */}
                <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 3,
                    background: "linear-gradient(90deg, var(--primary-dark), var(--primary))"
                }} />

                {/* ── Logo / Header — clique fixa/desfixa ── */}
                <div
                    onClick={() => setPinned(p => !p)}
                    style={{
                        padding: "18px 0", borderBottom: "1px solid var(--border)",
                        display: "flex", alignItems: "center",
                        justifyContent: expanded ? "space-between" : "center",
                        paddingLeft: expanded ? 16 : 0,
                        paddingRight: expanded ? 12 : 0,
                        cursor: "pointer", flexShrink: 0,
                        transition: "padding .25s",
                    }}
                    title={pinned ? "Clique para minimizar" : "Clique para fixar expandido"}
                >
                    {/* Logo ícone — sempre visível */}
                    <div style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: pinned ? "var(--primary-dark)" : "var(--primary)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 800, color: "#fff",
                        fontFamily: "var(--font-display)", flexShrink: 0,
                        transition: "background .2s",
                    }}>SF</div>

                    {/* Texto — aparece quando expandido */}
                    <div style={{
                        overflow: "hidden",
                        width: expanded ? 130 : 0,
                        opacity: expanded ? 1 : 0,
                        transition: "width .25s ease, opacity .2s ease",
                        marginLeft: expanded ? 10 : 0,
                    }}>
                        <div style={{
                            fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 800,
                            color: "var(--text)", whiteSpace: "nowrap"
                        }}>Smart Factory</div>
                        <div style={{
                            fontFamily: "var(--font-mono)", fontSize: 9,
                            color: "var(--primary)", letterSpacing: 1, whiteSpace: "nowrap"
                        }}>IIoT PLATFORM</div>
                    </div>

                    {/* Seta — indica estado fixado */}
                    <div style={{
                        opacity: expanded ? 1 : 0,
                        transition: "opacity .2s, transform .25s",
                        transform: pinned ? "rotate(180deg)" : "rotate(0deg)",
                        fontSize: 10, color: "var(--text3)", flexShrink: 0,
                    }}>◀</div>
                </div>

                {/* ── Nav ── */}
                <nav style={{ flex: 1, padding: "8px 0", overflowY: "auto", overflowX: "hidden" }}>
                    {NAV_ITEMS.map((item, i) => {
                        if (item.section) {
                            return (
                                <div key={i} style={{
                                    height: expanded ? "auto" : 0,
                                    overflow: "hidden",
                                    opacity: expanded ? 1 : 0,
                                    transition: "height .2s, opacity .2s",
                                    padding: expanded ? "14px 16px 4px" : "0 16px",
                                    fontSize: 10, fontWeight: 700, letterSpacing: 1,
                                    color: "var(--text3)", textTransform: "uppercase",
                                    whiteSpace: "nowrap",
                                }}>{item.section}</div>
                            );
                        }
                        if (!visible.includes(item.id)) return null;
                        const active = page === item.id;
                        return (
                            <div
                                key={`${item.id}-${i}`}
                                onClick={() => setPage(item.id)}
                                title={!expanded ? item.label : ""}
                                style={{
                                    display: "flex", alignItems: "center",
                                    gap: expanded ? 10 : 0,
                                    padding: expanded ? "9px 14px" : "9px 0",
                                    justifyContent: expanded ? "flex-start" : "center",
                                    margin: "1px 6px", borderRadius: 6, cursor: "pointer",
                                    background: active ? "var(--primary-soft)" : "transparent",
                                    color: active ? "var(--primary)" : "var(--text2)",
                                    transition: "all .15s",
                                    position: "relative",
                                }}
                            >
                                {/* Indicador ativo */}
                                {active && (
                                    <div style={{
                                        position: "absolute", left: 0, top: "20%", bottom: "20%",
                                        width: 3, borderRadius: "0 2px 2px 0", background: "var(--primary)"
                                    }} />
                                )}
                                <span style={{
                                    fontSize: 13, width: 20, textAlign: "center", flexShrink: 0,
                                    opacity: active ? 1 : .55,
                                }}>{item.icon}</span>

                                <span style={{
                                    fontSize: 13, fontWeight: active ? 600 : 500,
                                    overflow: "hidden", whiteSpace: "nowrap",
                                    width: expanded ? "auto" : 0,
                                    opacity: expanded ? 1 : 0,
                                    transition: "width .25s, opacity .2s",
                                    flex: 1,
                                }}>{item.label}</span>

                                {item.badge && expanded && (
                                    <span style={{
                                        borderRadius: 20, background: item.badgeColor + "22",
                                        border: `1px solid ${item.badgeColor}`,
                                        color: item.badgeColor, fontSize: 9,
                                        padding: "1px 6px", fontFamily: "var(--font-mono)",
                                        fontWeight: 600, whiteSpace: "nowrap",
                                    }}>{item.badge}</span>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* ── Footer ── */}
                <div style={{
                    padding: "10px 0", borderTop: "1px solid var(--border)",
                    background: "var(--bg1)", flexShrink: 0
                }}>
                    <div style={{
                        display: "flex", alignItems: "center",
                        justifyContent: expanded ? "flex-start" : "center",
                        gap: expanded ? 8 : 0,
                        padding: expanded ? "4px 16px" : "4px 0",
                        transition: "padding .25s",
                    }}>
                        <span style={{
                            width: 7, height: 7, borderRadius: "50%",
                            background: "var(--green)", display: "inline-block",
                            animation: "blink 2s infinite", flexShrink: 0
                        }} />
                        <span style={{
                            fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text3)",
                            overflow: "hidden", whiteSpace: "nowrap",
                            width: expanded ? "auto" : 0,
                            opacity: expanded ? 1 : 0,
                            transition: "opacity .2s",
                        }}>191.252.217.250</span>
                    </div>
                </div>
            </aside>

            {/* CSS mobile */}
            <style>{`
                @media (max-width: 768px) {
                    .sidebar-mobile-btn { display: flex !important; }
                    aside[class] {
                        position: fixed !important;
                        top: 0; left: 0; height: 100vh;
                        width: 260px !important; min-width: 260px !important;
                        transform: translateX(${mobileOpen ? "0" : "-100%"});
                        transition: transform .3s ease !important;
                        z-index: 1000;
                    }
                }
            `}</style>
        </>
    );
}
