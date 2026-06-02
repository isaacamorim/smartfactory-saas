// src/pages/MaquinaDashboardPage.jsx
import { useState, useEffect, useCallback } from "react";
import { PageHeader, OEEGauge } from "../components/UI";
import OEEPieChart from "../components/OEEPieChart";
import TurnoChart from "../components/TurnoChart";
import { getToken } from "../services/api";
import useMachineRealtime from "../hooks/useMachineRealtime";

const BASE_URL = "http://191.252.217.250:8000";

async function fetchMaquinaBySerial(serial) {
    const res = await fetch(`${BASE_URL}/maquinas/serial/${serial}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

async function fetchMeta(maquina_id) {
    const res = await fetch(`${BASE_URL}/maquinas/${maquina_id}/meta`, {
        headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return res.json();
}

const ESTADO_CFG = {
    PRODUZINDO: { color: "var(--green)", chip: "chip-green", label: "● PRODUZINDO" },
    PRONTA: { color: "var(--info)", chip: "chip-blue", label: "◎ PRONTA" },
    MANUAL: { color: "var(--orange)", chip: "chip-orange", label: "⚙ MANUAL" },
    OFFLINE: { color: "var(--text3)", chip: "chip-gray", label: "✕ OFFLINE" },
};

export default function MaquinaDashboardPage({ serial, back, canGoBack }) {
    const [maquinaInfo, setMaquinaInfo] = useState(null);
    const [meta, setMeta] = useState(null);
    const [infoLoading, setInfoLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const info = await fetchMaquinaBySerial(serial);
                setMaquinaInfo(info);
                setMeta(await fetchMeta(info.id));
            } catch (e) { console.error(e); }
            finally { setInfoLoading(false); }
        })();
    }, [serial]);

    const { loading, online, stale, machineState, status, kpis, turno, pesos, config, oee, forecast, lastUpdate, refresh } = useMachineRealtime(serial);

    if (loading || infoLoading) return (
        <div style={{ padding: 40, textAlign: "center", fontFamily: "var(--font-mono)", color: "var(--text3)" }}>Carregando máquina...</div>
    );

    const cfg = ESTADO_CFG[machineState] ?? ESTADO_CFG.OFFLINE;
    const nok = kpis.nok ?? 0;
    const ok = kpis.ok ?? 0;
    const total_qc = ok + nok || 1;
    const nok_pct = ((nok / total_qc) * 100).toFixed(1);
    const ok_pct = ((ok / total_qc) * 100).toFixed(1);
    const pesoLiqKg = ((pesos.liq_scaime ?? 0) / 10).toFixed(3);
    const turnoLabel = turno.atual === 1 ? "Turno 1" : turno.atual === 2 ? "Turno 2" : turno.atual === 3 ? "Turno 3" : "—";
    const prodTurnoAtual = turno.atual === 1 ? turno.t1 : turno.atual === 2 ? turno.t2 : turno.atual === 3 ? turno.t3 : status.prod_turno;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            <PageHeader
                title={serial}
                sub={`${maquinaInfo?.modelo ?? "—"} · ${turnoLabel} · ${new Date().toLocaleDateString("pt-BR")}`}
                action={
                    <div style={{ display: "flex", gap: 8 }}>
                        {canGoBack && <button onClick={back} style={{ fontFamily: "var(--font-mono)", fontSize: 11, padding: "4px 10px", borderRadius: 5, border: "1px solid var(--border)", cursor: "pointer", background: "var(--bg1)" }}>← Voltar</button>}
                        <span className={`chip ${cfg.chip}`}>{cfg.label}</span>
                        {online ? <span className="badge badge-live">● LIVE</span> : <span className="badge badge-offline">✕ OFFLINE</span>}
                    </div>
                }
            />

            {stale && (
                <div style={{ padding: "8px 14px", background: "rgba(255,150,0,.08)", border: "1px solid var(--orange)", borderRadius: 6, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--orange)", display: "flex", justifyContent: "space-between" }}>
                    <span>⚠ Dados desatualizados — {lastUpdate ? new Date(lastUpdate).toLocaleTimeString("pt-BR") : "nunca"}</span>
                    <button onClick={refresh} style={{ cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 10 }}>Atualizar</button>
                </div>
            )}

            {/* KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
                {[
                    ["OEE", `${oee.oee ?? 0}%`, "var(--primary)"],
                    ["Pac/min", status.pac_min ?? 0, "var(--info)"],
                    [turnoLabel, (prodTurnoAtual ?? 0).toLocaleString("pt-BR") + " un", "var(--green)"],
                    ["Previsão", (forecast.previsao_turno ?? 0).toLocaleString("pt-BR") + " un", "var(--orange)"],
                ].map(([l, v, c]) => (
                    <div key={l} className="sf-card" style={{ padding: "14px 18px" }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", marginBottom: 6 }}>{l}</div>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: c }}>{v}</div>
                    </div>
                ))}
            </div>

            {/* OEE + Produção turno */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14 }}>
                <div className="sf-card">
                    <div className="sf-card-header"><span className="sf-card-title">OEE</span></div>
                    <div className="sf-card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                        <OEEPieChart value={oee.oee ?? 0} size={140} />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, width: "100%" }}>
                            {[
                                ["DISP.", oee.disponibilidade, "var(--info)"],
                                ["PERF.", oee.performance, "var(--green)"],
                                ["QUAL.", oee.qualidade, "var(--primary)"],
                            ].map(([l, v, c]) => (
                                <div key={l} style={{ background: "var(--bg1)", border: "1px solid var(--border)", padding: "8px 10px", borderRadius: 6, textAlign: "center" }}>
                                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text3)", marginBottom: 4 }}>{l}</div>
                                    <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: c }}>{v ?? "—"}%</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="sf-card">
                    <div className="sf-card-header"><span className="sf-card-title">Produção por Turno</span></div>
                    <div className="sf-card-body">
                        <TurnoChart t1={turno.t1 ?? 0} t2={turno.t2 ?? 0} t3={turno.t3 ?? 0} turnoAtivo={turno.atual ?? 0} height={160} />
                    </div>
                </div>
            </div>

            {/* Pesagem */}
            <div className="sf-card">
                <div className="sf-card-header">
                    <span className="sf-card-title">Sistema de Pesagem</span>
                    <span className={`chip chip-${pesos.estavel ? "green" : "orange"}`}>{pesos.estavel ? "ESTÁVEL" : "AGUARDANDO"}</span>
                </div>
                <div className="sf-card-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, alignItems: "center" }}>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text3)", marginBottom: 4 }}>PESO LÍQUIDO</div>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, color: pesos.estavel ? "var(--green)" : "var(--text3)" }}>{pesoLiqKg}</div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text3)" }}>kg</div>
                    </div>
                    {[
                        ["Mínimo", (pesos.min ?? 0).toFixed(1) + " g", (pesos.min ?? 0) > 0 ? "var(--green)" : "var(--text3)"],
                        ["Média", (pesos.media ?? 0).toFixed(1) + " g", "var(--primary)"],
                        ["Máximo", (pesos.max ?? 0).toFixed(1) + " g", (pesos.max ?? 0) > 0 ? "var(--orange)" : "var(--text3)"],
                    ].map(([l, v, c]) => (
                        <div key={l} style={{ background: "var(--bg1)", padding: "12px 14px", borderRadius: 6, border: "1px solid var(--border)" }}>
                            <div style={{ fontSize: 10, color: "var(--text3)", fontWeight: 600, textTransform: "uppercase" }}>{l}</div>
                            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: c, marginTop: 4 }}>{v}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* OK/NOK + Status */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div style={{ padding: "16px", background: "rgba(45,154,78,.08)", border: "1px solid var(--green)", borderRadius: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--green)" }}>OK ({ok_pct}%)</div>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: "var(--green)", marginTop: 4 }}>{ok.toLocaleString("pt-BR")}</div>
                    </div>
                    <div style={{ padding: "16px", background: "rgba(220,53,69,.08)", border: "1px solid var(--red)", borderRadius: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--red)" }}>NOK ({nok_pct}%)</div>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: "var(--red)", marginTop: 4 }}>{nok.toLocaleString("pt-BR")}</div>
                    </div>
                </div>
                <div className="sf-card">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>
                        {[
                            ["Velocidade", (status.vel ?? 0) + " rpm", cfg.color],
                            ["Modo", status.auto === 1 ? "AUTO" : status.manual === 1 ? "MANUAL" : "PARADO", status.auto === 1 ? "var(--info)" : "var(--orange)"],
                            ["Total Geral", (status.total ?? 0).toLocaleString("pt-BR") + " un", "var(--text)"],
                        ].map(([l, v, c], i) => (
                            <div key={l} style={{ padding: "14px 16px", borderRight: i < 2 ? "1px solid var(--border)" : "none" }}>
                                <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", marginBottom: 6 }}>{l}</div>
                                <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: c }}>{v}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Meta OEE */}
            {meta && (
                <div className="sf-card">
                    <div className="sf-card-header"><span className="sf-card-title">Metas OEE</span></div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0 }}>
                        {[
                            ["Prod./hora", meta.meta_producao_hora + " un", "var(--text)"],
                            ["Disponib.", meta.meta_disponibilidade + "%", "var(--info)"],
                            ["Performance", meta.meta_performance + "%", "var(--green)"],
                            ["Qualidade", meta.meta_qualidade + "%", "var(--primary)"],
                        ].map(([l, v, c], i) => (
                            <div key={l} style={{ padding: "14px 18px", borderRight: i < 3 ? "1px solid var(--border)" : "none" }}>
                                <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", marginBottom: 6 }}>{l}</div>
                                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: c }}>{v}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}