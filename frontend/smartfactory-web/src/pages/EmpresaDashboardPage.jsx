// src/pages/EmpresaDashboardPage.jsx
// ─── Dashboard agregado de uma empresa ───────────────────────────────────────
// Endpoint: GET /empresas/{empresa_id}/dashboard (auth obrigatório)
// Mostra: KPIs globais, alertas, lista de linhas com OEE

import { useState, useEffect, useCallback } from "react";
import React, { useState, useEffect, useCallback } from "react";
import { PageHeader } from "../components/UI";
import { getToken } from "../services/api";
import { dashboardAPI, empresasAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import OEEPieChart from "../components/dashboard/OEEPieChart";
import TurnoChart from "../components/dashboard/TurnoChart";
import LinhaCard from "../components/dashboard/LinhaCard";
import EmpresaCard from "../components/dashboard/EmpresaCard";

const BASE_URL =
    import.meta.env.VITE_API_URL
    || "http://191.252.217.250:8000";

async function fetchEmpresaDashboard(empresa_id) {
    const res = await fetch(`${BASE_URL}/empresas/${empresa_id}/dashboard`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

// ─── ESTADO INDUSTRIAL ────────────────────────────────────────────────────────

const ESTADO_COLOR = {
    PRODUZINDO: "var(--green)",
    PRONTA: "var(--info)",
    MANUAL: "var(--orange)",
    OFFLINE: "var(--text3)",
};

const ESTADO_CHIP = {
    PRODUZINDO: <span className="chip chip-green">● PRODUZINDO</span>,
    PRONTA: <span className="chip chip-blue">◎ PRONTA</span>,
    MANUAL: <span className="chip chip-orange">⚙ MANUAL</span>,
    OFFLINE: <span className="chip chip-red">✕ OFFLINE</span>,
};

// ─── COMPONENTE ───────────────────────────────────────────────────────────────

export default function EmpresaDashboardPage({ empresa_id, navigate, back, canGoBack }) {
    const [data, setData] = useState(null);
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const auth = useAuth();

    const isAdmin = auth.usuario?.role === 'admin';
    const showSelection = isAdmin && !empresa_id;

    const load = useCallback(async () => {
        try {
            const result = await fetchEmpresaDashboard(empresa_id);
            setData(result);
            if (showSelection) {
                const res = await empresasAPI.listar();
                setEmpresas(res.data || []);
            } else {
                const targetId = empresa_id || auth.usuario?.empresa_id;
                if (!targetId) throw new Error("ID da empresa não definido.");
                
                const res = await dashboardAPI.getEmpresa(targetId);
                setData(res.data);
            }
            setError(null);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [empresa_id]);
    }, [empresa_id, showSelection, auth.usuario?.empresa_id]);

    useEffect(() => {
        load();
        const t = setInterval(load, 30_000);
        return () => clearInterval(t);
    }, [load]);

    if (loading) return (
        <div style={{ padding: 40, textAlign: "center", fontFamily: "var(--font-mono)", color: "var(--text3)" }}>
            Carregando dashboard da empresa...
            Sincronizando dados industriais...
        </div>
    );

    if (error) return (
        <div style={{ padding: 40, textAlign: "center", fontFamily: "var(--font-mono)", color: "var(--red)" }}>
            Erro: {error}
            <button onClick={load} style={{ marginLeft: 12, cursor: "pointer" }}>Tentar novamente</button>
        </div>
    );

    // --- VISÃO ADMIN: SELEÇÃO DE EMPRESA ---
    if (showSelection) {
        return (
            <div style={{ padding: 20 }}>
                <PageHeader title="Unidades Industriais" sub="Selecione uma planta para monitoramento" />
                <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
                    gap: 24, 
                    marginTop: 24 
                }}>
                    {empresas.map(emp => (
                        <EmpresaCard 
                            key={emp.id} 
                            empresa={emp} 
                            onClick={() => navigate("empresa_dashboard", { empresa_id: emp.id })} 
                        />
                    ))}
                </div>
            </div>
        );
    }

    const alertasCritical = (data.alertas ?? []).filter(a => a.severity === "critical");
    const alertasWarning = (data.alertas ?? []).filter(a => a.severity === "warning");

    // Formatação de dados para os gráficos
    const producaoChartData = [
        { name: 'T1', producao: data.turnos?.t1_total || 0 },
        { name: 'T2', producao: data.turnos?.t2_total || 0 },
        { name: 'T3', producao: data.turnos?.t3_total || 0 },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* ── Header ── */}
            <PageHeader
                title={data.nome}
                sub={`Dashboard Empresa · ${data.machines_online}/${data.machines_total} máquinas online`}
                action={
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        {canGoBack && (
                            <button onClick={back} style={{
                                fontFamily: "var(--font-mono)", fontSize: 11,
                                padding: "4px 10px", borderRadius: 5,
                                border: "1px solid var(--border)", cursor: "pointer",
                                background: "var(--bg1)",
                            }}>← Voltar</button>
                        )}
                        <span className="badge badge-live">● LIVE</span>
                        {isAdmin && (
                            <button onClick={() => navigate("empresa_dashboard", {})} className="btn-secondary" style={{ fontSize: 11 }}>Trocar Unidade</button>
                        )}
                        <span className="badge badge-live">● REAL-TIME</span>
                    </div>
                }
            />

            {/* ── Alertas críticos ── */}
            {alertasCritical.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {alertasCritical.map((a, i) => (
                        <div key={i} style={{
                            padding: "8px 14px",
                            background: "rgba(220,53,69,.08)",
                            border: "1px solid var(--red)",
                            borderRadius: 6,
                            fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--red)",
                            display: "flex", gap: 10,
                        }}>
                            <span>✕</span>
                            <span><strong>{a.machine}</strong> — {a.mensagem}</span>
                        </div>
                    ))}
            {/* ── Alertas como Chips ── */}
            {(alertasCritical.length > 0 || alertasWarning.length > 0) && (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {alertasCritical.map((a, i) => <span key={i} className="chip chip-red">⚠ {a.machine}: CRÍTICO</span>)}
                    {alertasWarning.map((a, i) => <span key={i} className="chip chip-orange">⚠ {a.machine}: AVISO</span>)}
                </div>
            )}

            {/* ── KPIs globais ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14 }}>
                {[
                    ["Online", `${data.machines_online}/${data.machines_total}`, "var(--green)"],
                    ["Offline", data.machines_offline, "var(--red)"],
                    ["OEE Médio", `${data.oee_medio}%`, "var(--primary)"],
                    ["Produção Turno", (data.producao_total ?? 0).toLocaleString("pt-BR") + " un", "var(--info)"],
                    ["Vel. Média", `${data.vel_media} rpm`, "var(--text)"],
                ].map(([l, v, c]) => (
                    <div key={l} className="sf-card" style={{ padding: "14px 18px" }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", marginBottom: 6 }}>{l}</div>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: c }}>{v}</div>
            {/* ── Visual KPIs (OEE + Produção) ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20 }}>
                <div className="sf-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 20 }}>
                    <div style={{ alignSelf: "flex-start", fontSize: 11, fontWeight: 700, color: "var(--text3)", marginBottom: 15 }}>OEE MÉDIO GLOBAL</div>
                    <OEEPieChart value={data.oee_medio || 0} size={160} />
                </div>

                <div className="sf-card" style={{ padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)" }}>FLUXO DE PRODUÇÃO POR TURNO</div>
                        <div style={{ fontSize: 10, color: "var(--primary)" }}>TOTAL: {(data.producao_total || 0).toLocaleString()} un</div>
                    </div>
                ))}
            </div>

            {/* ── Turnos ── */}
            <div className="sf-card">
                <div className="sf-card-header">
                    <span className="sf-card-title">Produção por Turno — Empresa</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text3)" }}>
                        Turno ativo: T{data.turnos?.turno_ativo ?? "—"}
                    </span>
                    <TurnoChart data={producaoChartData} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>
                    {[
                        ["Turno 1", data.turnos?.t1_total, data.turnos?.turno_ativo === 1],
                        ["Turno 2", data.turnos?.t2_total, data.turnos?.turno_ativo === 2],
                        ["Turno 3", data.turnos?.t3_total, data.turnos?.turno_ativo === 3],
                    ].map(([l, v, ativo], i) => (
                        <div key={l} style={{
                            padding: "20px 24px",
                            borderRight: i < 2 ? "1px solid var(--border)" : "none",
                            background: ativo ? "rgba(213,32,41,.04)" : "transparent",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                <span style={{ fontSize: 11, fontWeight: 600, color: ativo ? "var(--primary)" : "var(--text3)", textTransform: "uppercase" }}>{l}</span>
                                {ativo && <span className="chip chip-red" style={{ fontSize: 9 }}>● ATIVO</span>}
                            </div>
                            <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: ativo ? "var(--primary)" : "var(--text2)" }}>
                                {(v ?? 0).toLocaleString("pt-BR")}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>unidades</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Linhas ── */}
            <div className="sf-card">
                <div className="sf-card-header">
                    <span className="sf-card-title">Linhas de Produção</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text3)" }}>
                        {(data.linhas ?? []).length} linha(s)
                    </span>
            {/* ── Linhas de Produção em Grid de Cards ── */}
            <section style={{ marginTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
                    <h3 style={{ margin: 0, fontSize: 16 }}>Linhas de Produção</h3>
                    <span style={{ fontSize: 10, color: "var(--text3)" }}>{(data.linhas ?? []).length} ATIVOS</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {(data.linhas ?? []).map((linha, i) => (
                        <div
                            key={linha.linha_id}
                                <div style={{ 
                                    display: "grid", 
                                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
                                    gap: 20 
                                }}>
                    {(data.linhas ?? []).map((linha) => (
                        <LinhaCard 
                            key={linha.linha_id} 
                            linha={{
                                id: linha.linha_id,
                                nome: linha.nome,
                                oee: linha.oee_medio,
                                producao_real: linha.producao_total,
                                maquinas_online: linha.machines_online,
                                total_maquinas: linha.machines_total,
                                alertas: linha.machines_offline // Exemplo de mapeamento
                            }} 
                            onClick={() => navigate("linha_dashboard", {
                                empresa_id: empresa_id,
                                empresa_id: empresa_id || auth.usuario?.empresa_id,
                                linha_id: linha.linha_id,
                            })}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 80px",
                                alignItems: "center",
                                padding: "16px 20px",
                                borderBottom: i < (data.linhas.length - 1) ? "1px solid var(--border)" : "none",
                                cursor: "pointer",
                                transition: "background .15s",
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "var(--bg1)"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 14 }}>{linha.nome}</div>
                                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text3)", marginTop: 2 }}>
                                    {linha.machines_online}/{linha.machines_total} máquinas online
                                </div>
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 10, color: "var(--text3)", marginBottom: 4 }}>OEE</div>
                                <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "var(--primary)" }}>
                                    {linha.oee_medio}%
                                </div>
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 10, color: "var(--text3)", marginBottom: 4 }}>Produção</div>
                                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700 }}>
                                    {(linha.producao_total ?? 0).toLocaleString("pt-BR")}
                                </div>
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 10, color: "var(--text3)", marginBottom: 4 }}>Vel. Média</div>
                                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700 }}>
                                    {linha.vel_media} rpm
                                </div>
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 10, color: "var(--text3)", marginBottom: 4 }}>Offline</div>
                                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: linha.machines_offline > 0 ? "var(--red)" : "var(--text3)" }}>
                                    {linha.machines_offline}
                                </div>
                            </div>
                            <div style={{ textAlign: "right", color: "var(--text3)", fontSize: 16 }}>›</div>
                        </div>
                            })} 
                        />
                    ))}
                </div>
            </div>
            </section>

            {/* ── Alertas warning ── */}
            {alertasWarning.length > 0 && (
                <div className="sf-card">
                    <div className="sf-card-header">
                        <span className="sf-card-title">Avisos</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--orange)" }}>
                            {alertasWarning.length} aviso(s)
                        </span>
                    </div>
                    <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
                        {alertasWarning.map((a, i) => (
                            <div key={i} style={{
                                fontFamily: "var(--font-mono)", fontSize: 11,
                                color: "var(--orange)", display: "flex", gap: 10,
                            }}>
                                <span>⚠</span>
                                <span><strong>{a.machine}</strong> — {a.mensagem}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}