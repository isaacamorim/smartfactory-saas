// src/pages/LinhaDashboardPage.jsx
import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "../components/UI";
import OEEPieChart from "../components/OEEPieChart";
import TurnoChart from "../components/TurnoChart";
import { getToken } from "../services/api";

const BASE_URL = "http://191.252.217.250:8000";

async function fetchLinha(empresa_id, linha_id) {
    const res = await fetch(`${BASE_URL}/empresas/${empresa_id}/linhas/${linha_id}/dashboard`, {
        headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

const ESTADO_CFG = {
    PRODUZINDO: { chip: "chip-green", label: "● PRODUZINDO" },
    PRONTA: { chip: "chip-blue", label: "◎ PRONTA" },
    MANUAL: { chip: "chip-orange", label: "⚙ MANUAL" },
    OFFLINE: { chip: "chip-gray", label: "✕ OFFLINE" },
};

function MaquinaCard({ m, onOpen }) {
    const cfg = ESTADO_CFG[m.estado] ?? ESTADO_CFG.OFFLINE;
    return (
        <div
            className="sf-card"
            onClick={() => onOpen(m.serial)}
            style={{ cursor: "pointer", opacity: m.online ? 1 : 0.6, transition: "box-shadow .15s, transform .15s" }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.1)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = ""; e.currentTarget.style.transform = ""; }}
        >
            <div className="sf-card-header">
                <div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700 }}>{m.serial}</div>
                    <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 2 }}>{m.modelo ?? "—"}</div>
                </div>
                <span className={`chip ${cfg.chip}`} style={{ fontSize: 9 }}>{cfg.label}</span>
            </div>
            <div className="sf-card-body" style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <OEEPieChart value={m.oee ?? 0} size={90} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                        ["Velocidade", (m.vel ?? 0) + " rpm", "var(--info)"],
                        ["Prod. Turno", (m.prod_turno ?? 0).toLocaleString("pt-BR") + " un", "var(--text)"],
                        ["OK / NOK", `${m.ok ?? 0} / ${m.nok ?? 0}`, "var(--text3)"],
                    ].map(([l, v, c]) => (
                        <div key={l}>
                            <div style={{ fontSize: 9, color: "var(--text3)", fontWeight: 600, textTransform: "uppercase" }}>{l}</div>
                            <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: c }}>{v}</div>
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ padding: "8px 16px", borderTop: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text3)", textAlign: "right" }}>
                Ver máquina →
            </div>
        </div>
    );
}

export default function LinhaDashboardPage({ empresa_id, linha_id, navigate, back, canGoBack }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        try { setData(await fetchLinha(empresa_id, linha_id)); setError(null); }
        catch (e) { setError(e.message); }
        finally { setLoading(false); }
    }, [empresa_id, linha_id]);

    useEffect(() => { load(); const t = setInterval(load, 15_000); return () => clearInterval(t); }, [load]);

    if (loading) return <div style={{ padding: 40, textAlign: "center", fontFamily: "var(--font-mono)", color: "var(--text3)" }}>Carregando linha...</div>;
    if (error) return <div style={{ padding: 40, textAlign: "center", fontFamily: "var(--font-mono)", color: "var(--red)" }}>Erro: {error} <button onClick={load}>Retry</button></div>;

    const online = (data.maquinas ?? []).filter(m => m.online);
    const offline = (data.maquinas ?? []).filter(m => !m.online);

    // turno ativo = o que mais máquinas estão
    const turnoAtivo = [1, 2, 3].reduce((best, t) =>
        (data.maquinas ?? []).filter(m => m.turno_atual === t).length >
            (data.maquinas ?? []).filter(m => m.turno_atual === best).length ? t : best, 1);

    const t1 = (data.maquinas ?? []).reduce((s, m) => s + (m.t1 ?? 0), 0);
    const t2 = (data.maquinas ?? []).reduce((s, m) => s + (m.t2 ?? 0), 0);
    const t3 = (data.maquinas ?? []).reduce((s, m) => s + (m.t3 ?? 0), 0);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <PageHeader
                title={data.nome}
                sub={`Linha · ${data.machines_online}/${data.machines_total} online · OEE ${data.oee_medio}%`}
                action={
                    <div style={{ display: "flex", gap: 8 }}>
                        {canGoBack && <button onClick={back} style={{ fontFamily: "var(--font-mono)", fontSize: 11, padding: "4px 10px", borderRadius: 5, border: "1px solid var(--border)", cursor: "pointer", background: "var(--bg1)" }}>← Voltar</button>}
                    </div>
                }
            />

            {/* KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
                {[
                    ["Online", `${data.machines_online}/${data.machines_total}`, "var(--green)"],
                    ["OEE Médio", `${data.oee_medio}%`, "var(--primary)"],
                    ["Produção", (data.producao_total ?? 0).toLocaleString("pt-BR") + " un", "var(--info)"],
                    ["Vel. Média", `${data.vel_media} rpm`, "var(--text)"],
                ].map(([l, v, c]) => (
                    <div key={l} className="sf-card" style={{ padding: "14px 18px" }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", marginBottom: 6 }}>{l}</div>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: c }}>{v}</div>
                    </div>
                ))}
            </div>

            {/* OEE + Turnos */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14 }}>
                <div className="sf-card">
                    <div className="sf-card-header"><span className="sf-card-title">OEE Linha</span></div>
                    <div className="sf-card-body" style={{ display: "flex", justifyContent: "center" }}>
                        <OEEPieChart value={data.oee_medio ?? 0} size={150} />
                    </div>
                </div>
                <div className="sf-card">
                    <div className="sf-card-header"><span className="sf-card-title">Produção por Turno</span></div>
                    <div className="sf-card-body">
                        <TurnoChart t1={t1} t2={t2} t3={t3} turnoAtivo={turnoAtivo} height={130} />
                    </div>
                </div>
            </div>

            {/* Cards máquinas online */}
            {online.length > 0 && (
                <div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text3)", fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>
                        Online ({online.length})
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 14 }}>
                        {online.map(m => <MaquinaCard key={m.serial} m={m} onOpen={serial => navigate("maquina_dashboard", { serial })} />)}
                    </div>
                </div>
            )}

            {/* Cards máquinas offline */}
            {offline.length > 0 && (
                <div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text3)", fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>
                        Offline ({offline.length})
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 14 }}>
                        {offline.map(m => <MaquinaCard key={m.serial} m={m} onOpen={serial => navigate("maquina_dashboard", { serial })} />)}
                    </div>
                </div>
            )}
        </div>
    );
}