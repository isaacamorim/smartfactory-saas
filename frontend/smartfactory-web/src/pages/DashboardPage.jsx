// src/pages/DashboardPage.jsx
// ─── Dashboard industrial — dados reais da API REST ───────────────────────────
// Campos baseados no /summary real: vel, prod_turno, total, turno, t1/t2/t3,
// ok, nok, pac_min, auto, ciclo, peso_ref, tol_min, tol_max, liq_scaime,
// estavel, min, max, media, alive, hb

import { useState, useEffect, useCallback } from "react";
import { StatCard, OEEGauge, PageHeader } from "../components/UI";
import useMachineRealtime from "../hooks/useMachineRealtime";
import { getDashboard, getAlerts } from "../services/metricsData";

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────

const SERIAL = "eva1200-01_26";
const META_PAC_MIN = 45;
const META_OEE = 75;

// ─────────────────────────────────────────────
// CHIPS DE ESTADO
// ─────────────────────────────────────────────

const STATE_CHIP = {
    RUNNING: <span className="chip chip-green">● RODANDO</span>,
    MANUAL: <span className="chip chip-orange">● MANUAL</span>,
    IDLE: <span className="chip chip-gray">● PARADA</span>,
    STALE: <span className="chip chip-orange">⚠ SEM DADOS</span>,
    OFFLINE: <span className="chip chip-red">✕ OFFLINE</span>,
};

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────

export default function DashboardPage({ auth }) {

    // ── Dados da máquina (realtime) ───────────────────────────────────────────
    const {
        loading,
        error,
        online,
        stale,
        machineState,
        data,
        status,
        kpis,
        turno,
        pesos,
        config,
        oee,
        forecast,
        lastUpdate,
        refresh,
    } = useMachineRealtime(SERIAL);

    // ── KPIs globais (dashboard endpoint) ────────────────────────────────────
    const [globalKpis, setGlobalKpis] = useState(null);
    const [alerts, setAlerts] = useState([]);

    const loadGlobal = useCallback(async () => {
        try {
            const [dash, al] = await Promise.allSettled([
                getDashboard(),
                getAlerts(),
            ]);
            if (dash.status === "fulfilled") setGlobalKpis(dash.value);
            if (al.status === "fulfilled") setAlerts(al.value);
        } catch (e) {
            console.error("loadGlobal:", e);
        }
    }, []);

    useEffect(() => {
        loadGlobal();
        const t = setInterval(loadGlobal, 15_000);
        return () => clearInterval(t);
    }, [loadGlobal]);

    // ── Loading / erro ────────────────────────────────────────────────────────

    if (loading) return (
        <div style={{ padding: 40, textAlign: "center", fontFamily: "var(--font-mono)", color: "var(--text3)" }}>
            Carregando dados da máquina...
        </div>
    );

    if (error && !data) return (
        <div style={{ padding: 40, textAlign: "center", fontFamily: "var(--font-mono)", color: "var(--red)" }}>
            Erro: {error?.message ?? "falha na comunicação"}
            <button onClick={refresh} style={{ marginLeft: 16, cursor: "pointer" }}>
                Tentar novamente
            </button>
        </div>
    );

    // ── Valores derivados ─────────────────────────────────────────────────────

    const nok = kpis.nok ?? 0;
    const ok = kpis.ok ?? 0;
    const total_qc = ok + nok || 1;
    const nok_pct = ((nok / total_qc) * 100).toFixed(1);
    const ok_pct = ((ok / total_qc) * 100).toFixed(1);

    // Peso líquido — liq_scaime é o valor confiável (liq pode vir -9999999)
    const pesoLiqKg = (pesos.liq_scaime / 10).toFixed(3);

    // Turno ativo — qual tem valor > 0 e corresponde ao turno atual
    const turnoLabel = turno.atual === 1 ? "Turno 1"
        : turno.atual === 2 ? "Turno 2"
            : turno.atual === 3 ? "Turno 3"
                : "—";

    const prodTurnoAtual = turno.atual === 1 ? turno.t1
        : turno.atual === 2 ? turno.t2
            : turno.atual === 3 ? turno.t3
                : status.prod_turno;

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* ── Header ── */}
            <PageHeader
                title="Dashboard Industrial"
                sub={`${SERIAL} · ${turnoLabel} · ${new Date().toLocaleDateString("pt-BR")}`}
                action={
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        {STATE_CHIP[machineState] ?? STATE_CHIP.OFFLINE}
                        {online
                            ? <span className="badge badge-live">● LIVE</span>
                            : <span className="badge badge-offline">✕ OFFLINE</span>
                        }
                    </div>
                }
            />

            {/* ── Banner stale ── */}
            {stale && !loading && (
                <div style={{
                    padding: "10px 16px",
                    background: "rgba(255,150,0,.08)",
                    border: "1px solid var(--orange)",
                    borderRadius: 6,
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--orange)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}>
                    <span>
                        ⚠ Dados desatualizados — última sync:{" "}
                        {lastUpdate ? new Date(lastUpdate).toLocaleTimeString("pt-BR") : "nunca"}
                    </span>
                    <button onClick={refresh} style={{ cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                        Atualizar agora
                    </button>
                </div>
            )}

            {/* ── Alertas ativos ── */}
            {alerts.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {alerts.slice(0, 3).map((a, i) => (
                        <div key={i} style={{
                            padding: "8px 14px",
                            background: a.severity === "critical" ? "rgba(220,53,69,.08)" : "rgba(224,123,0,.08)",
                            border: `1px solid ${a.severity === "critical" ? "var(--red)" : "var(--orange)"}`,
                            borderRadius: 6,
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            color: a.severity === "critical" ? "var(--red)" : "var(--orange)",
                            display: "flex",
                            gap: 12,
                        }}>
                            <span>{a.severity === "critical" ? "✕" : "⚠"}</span>
                            <span><strong>{a.machine}</strong> — {a.mensagem}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* ── KPIs globais (dashboard endpoint) ── */}
            {globalKpis && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14 }}>
                    {[
                        ["Máquinas Online", `${globalKpis.machines_online}/${globalKpis.machines_total}`, "var(--green)"],
                        ["Offline", globalKpis.machines_offline, "var(--red)"],
                        ["Produção Global", globalKpis.prod_turno_total?.toLocaleString("pt-BR") + " un", "var(--primary)"],
                        ["Vel. Média", globalKpis.vel_media + " rpm", "var(--info)"],
                        ["Total Peças", globalKpis.total_pecas?.toLocaleString("pt-BR"), "var(--text)"],
                    ].map(([l, v, c]) => (
                        <div key={l} className="sf-card" style={{ padding: "14px 18px" }}>
                            <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", marginBottom: 6 }}>{l}</div>
                            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: c }}>{v}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── KPIs da máquina ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
                <StatCard
                    label="OEE — Turno"
                    value={oee.oee ?? "—"}
                    unit="%"
                    accent="var(--primary)"
                    delta={`Meta: ${META_OEE}% · ${oee.oee >= META_OEE ? "✓ acima" : "⚠ abaixo"}`}
                    deltaPos={oee.oee >= META_OEE}
                />
                <StatCard
                    label="Pacotes / Min"
                    value={status.pac_min ?? "—"}
                    unit="pct/min"
                    accent="var(--info)"
                    delta={`Meta: ${META_PAC_MIN} · ${status.pac_min >= META_PAC_MIN ? "✓ OK" : "⚠ baixo"}`}
                    deltaPos={status.pac_min >= META_PAC_MIN}
                />
                <StatCard
                    label={`Produção ${turnoLabel}`}
                    value={(prodTurnoAtual ?? 0).toLocaleString("pt-BR")}
                    unit="un"
                    accent="var(--green)"
                    delta={`NOK: ${nok} un · ${nok_pct}%`}
                    deltaPos={false}
                />
                <StatCard
                    label="Previsão Turno"
                    value={(forecast.previsao_turno ?? 0).toLocaleString("pt-BR")}
                    unit="un"
                    accent="var(--orange)"
                    delta={`Média: ${forecast.media_hora} un/h`}
                    deltaPos={true}
                />
            </div>

            {/* ── OEE + Pesagem ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

                {/* OEE */}
                <div className="sf-card">
                    <div className="sf-card-header">
                        <span className="sf-card-title">OEE — {SERIAL}</span>
                        {online
                            ? <span className="badge badge-live">● LIVE</span>
                            : <span className="badge badge-offline">✕ OFFLINE</span>
                        }
                    </div>
                    <div className="sf-card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                        <OEEGauge value={oee.oee ?? 0} size={160} />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, width: "100%" }}>
                            {[
                                ["DISP.", oee.disponibilidade, "var(--info)"],
                                ["PERF.", oee.performance, "var(--green)"],
                                ["QUAL.", oee.qualidade, "var(--primary)"],
                            ].map(([l, v, c]) => (
                                <div key={l} style={{
                                    background: "var(--bg1)", border: "1px solid var(--border)",
                                    padding: "10px 12px", borderRadius: 6, textAlign: "center",
                                }}>
                                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text3)", marginBottom: 5 }}>{l}</div>
                                    <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: c }}>{v ?? "—"}%</div>
                                    <div style={{ marginTop: 6, height: 4, background: "var(--bg3)", borderRadius: 99, overflow: "hidden" }}>
                                        <div style={{ width: `${v ?? 0}%`, height: "100%", background: c, borderRadius: 99 }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pesagem */}
                <div className="sf-card">
                    <div className="sf-card-header">
                        <span className="sf-card-title">Sistema de Pesagem</span>
                        <span className={`chip chip-${pesos.estavel ? "green" : "orange"}`}>
                            {pesos.estavel ? "ESTÁVEL" : "AGUARDANDO"}
                        </span>
                    </div>
                    <div className="sf-card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                        {/* Peso líquido */}
                        <div style={{ textAlign: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text3)", letterSpacing: 2, marginBottom: 4 }}>PESO LÍQUIDO (SCAIME)</div>
                            <div style={{
                                fontFamily: "var(--font-display)", fontSize: 52, fontWeight: 800,
                                color: pesos.estavel ? "var(--green)" : "var(--text3)", lineHeight: 1,
                            }}>
                                {pesoLiqKg}
                            </div>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text3)", marginTop: 4 }}>
                                kg · ref: {(config.peso_ref / 1000).toFixed(3)} kg
                            </div>
                        </div>

                        {/* CEP */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                            {[
                                ["Mínimo", pesos.min.toFixed(1) + " g", pesos.min > 0 ? "var(--green)" : "var(--text3)"],
                                ["Média", pesos.media.toFixed(1) + " g", "var(--primary)"],
                                ["Máximo", pesos.max.toFixed(1) + " g", pesos.max > 0 ? "var(--orange)" : "var(--text3)"],
                            ].map(([l, v, c]) => (
                                <div key={l} style={{ background: "var(--bg1)", padding: "8px 10px", borderRadius: 6, border: "1px solid var(--border)" }}>
                                    <div style={{ fontSize: 10, color: "var(--text3)", fontWeight: 600, textTransform: "uppercase" }}>{l}</div>
                                    <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: c, marginTop: 2 }}>{v}</div>
                                </div>
                            ))}
                        </div>

                        {/* Tolerância */}
                        <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "8px 12px", background: "var(--bg1)", borderRadius: 6, border: "1px solid var(--border)" }}>
                            <span style={{ fontSize: 10, color: "var(--text3)", fontWeight: 600 }}>TOLERÂNCIA</span>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text2)" }}>
                                {config.tol_min} g – {config.tol_max} g
                            </span>
                        </div>

                        {/* OK / NOK */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            <div style={{ padding: "10px 14px", background: "rgba(45,154,78,.08)", border: "1px solid var(--green)", borderRadius: 6 }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--green)", textTransform: "uppercase" }}>
                                    OK <span style={{ fontWeight: 400, fontSize: 10 }}>({ok_pct}%)</span>
                                </div>
                                <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--green)" }}>
                                    {ok.toLocaleString("pt-BR")}
                                </div>
                            </div>
                            <div style={{ padding: "10px 14px", background: "rgba(220,53,69,.08)", border: "1px solid var(--red)", borderRadius: 6 }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--red)", textTransform: "uppercase" }}>
                                    NOK <span style={{ fontWeight: 400, fontSize: 10 }}>({nok_pct}%)</span>
                                </div>
                                <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--red)" }}>
                                    {nok.toLocaleString("pt-BR")}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Status da máquina ── */}
            <div className="sf-card">
                <div className="sf-card-header">
                    <span className="sf-card-title">Status — {SERIAL}</span>
                    {STATE_CHIP[machineState] ?? STATE_CHIP.OFFLINE}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 0 }}>
                    {[
                        ["Velocidade", status.vel + " rpm", "var(--info)"],
                        ["Pac/min", status.pac_min, "var(--primary)"],
                        ["Modo", status.ciclo === 1 ? "ciclo" : status.manual === 1 ? "MANUAL" : "PARADO",
                            status.ciclo === 1 ? "var(--green)" : "var(--orange)"],
                        ["Turno", turnoLabel, "var(--text)"],
                        ["Prod. Turno", (prodTurnoAtual ?? 0).toLocaleString("pt-BR") + " un", "var(--text)"],
                        ["Total Geral", (status.total ?? 0).toLocaleString("pt-BR") + " un", "var(--text)"],
                    ].map(([l, v, c], i) => (
                        <div key={l} style={{ padding: "16px 18px", borderRight: i < 5 ? "1px solid var(--border)" : "none" }}>
                            <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", marginBottom: 6 }}>{l}</div>
                            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: c }}>{v}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Turnos ── */}
            <div className="sf-card">
                <div className="sf-card-header">
                    <span className="sf-card-title">Produção por Turno</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text3)" }}>
                        Total acumulado
                    </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>
                    {[
                        ["Turno 1", turno.t1, turno.atual === 1],
                        ["Turno 2", turno.t2, turno.atual === 2],
                        ["Turno 3", turno.t3, turno.atual === 3],
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

        </div>
    );
}