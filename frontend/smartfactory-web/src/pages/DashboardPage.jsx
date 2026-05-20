// src/pages/DashboardPage.jsx
import { StatCard, OEEGauge, OEEMiniBar, PageHeader, SevBar } from "../components/UI";
import useMachineRealtime from "../hooks/useMachineRealtime";

// ─────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────

const SERIAL = "eva1200-01_26";
const META_PAC_MIN = 45;

// ─────────────────────────────────────────────
// HELPERS VISUAIS
// ─────────────────────────────────────────────

const MACHINE_STATE_CHIP = {

    RUNNING:
        <span className="chip chip-green">
            ● RODANDO
        </span>,

    IDLE:
        <span className="chip chip-orange">
            ● PARADA
        </span>,

    OFFLINE:
        <span className="chip chip-red">
            ✕ OFFLINE
        </span>,

    STALE:
        <span className="chip chip-orange">
            ⚠ SEM DADOS
        </span>

}

const getMachineStateChip = (machineState) =>
    MACHINE_STATE_CHIP[machineState] ?? <span className="chip chip-gray">— DESCONHECIDO</span>;

// ─────────────────────────────────────────────
// PÁGINA
// ─────────────────────────────────────────────

export default function DashboardPage({ auth }) {

    const {
        loading,
        error,
        online,
        stale,
        machineState,
        status,
        pesos,
        turno,
        kpis,
        config,
        oee,
        lastUpdate,
        refresh,
    } = useMachineRealtime(SERIAL);

    // ── Loading ──────────────────────────────

    if (loading) return (
        <div style={{ padding: 40, textAlign: "center", fontFamily: "var(--font-mono)", color: "var(--text3)" }}>
            Carregando dados da máquina...
        </div>
    );

    // ── Erro fatal (sem nenhum dado ainda) ───

    if (error && !status?.turno) return (
        <div style={{ padding: 40, textAlign: "center", fontFamily: "var(--font-mono)", color: "var(--red)" }}>
            Erro ao carregar dados: {error?.message ?? "falha na comunicação"}
            <button onClick={refresh} style={{ marginLeft: 16, cursor: "pointer" }}>
                Tentar novamente
            </button>
        </div>
    );

    // ── Valores derivados ────────────────────

    const peso = Number(
        pesos?.liq
    )

    const ultimoPesoKg =
        (
            (
                peso > -999999
                    ?
                    peso
                    :
                    0
            )
            /
            1000
        )
            .toFixed(3);
    const nok = kpis.nok ?? 0;
    const ok = kpis.ok ?? 0;
    const nok_pct = ((nok / ((ok + nok) || 1)) * 100).toFixed(1);

    // ── Render ───────────────────────────────

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* ── Header ── */}
            <PageHeader
                title="Dashboard Industrial"
                sub={`SERIAL: ${SERIAL} · TURNO ${status.turno ?? "—"} · ${new Date().toLocaleDateString("pt-BR")}`}
                action={
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        {getMachineStateChip(machineState)}
                        {online
                            ? <span className="badge badge-live">● LIVE</span>
                            : <span className="badge badge-offline">✕ OFFLINE</span>
                        }
                    </div>
                }
            />

            {/* ── Banner de dados obsoletos ── */}
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
                    <span>⚠ Dados podem estar desatualizados — última sincronização: {lastUpdate
                        ? new Date(lastUpdate).toLocaleTimeString("pt-BR")
                        : "nunca"
                    }</span>
                    <button
                        onClick={refresh}
                        style={{ cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 11 }}
                    >
                        Atualizar agora
                    </button>
                </div>
            )}

            {/* ── KPIs principais ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
                <StatCard
                    label="OEE — Turno"
                    value={oee?.oee ?? "—"}
                    unit="%"
                    accent="var(--primary)"
                    delta={`Meta: 75% · ${(oee?.oee ?? 0) >= 75 ? "✓ acima" : "⚠ abaixo"}`}
                    deltaPos={(oee?.oee ?? 0) >= 75}
                />
                <StatCard
                    label="Pacotes / Min"
                    value={status.pac_min ?? "—"}
                    unit="pct/min"
                    accent="var(--info)"
                    delta={`Meta: ${META_PAC_MIN} pct/min`}
                    deltaPos={(status.vel ?? 0) >= META_PAC_MIN}
                />
                <StatCard
                    label="Produção Turno"
                    value={
                        (
                            kpis.prod_turno
                            ??
                            0
                        ).toLocaleString("pt-BR")
                    }
                    unit="un"
                    accent="var(--green)"
                    delta={`NOK: ${nok} un · ${nok_pct}%`}
                    deltaPos={false}
                />
                <StatCard
                    label="Último Peso"
                    value={ultimoPesoKg}
                    unit="kg"
                    accent={(kpis.ult_peso ?? 0) > 0 ? "var(--green)" : "var(--text3)"}
                />
            </div>

            {/* ── OEE + Pesagem ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

                {/* OEE Gauge */}
                <div className="sf-card">
                    <div className="sf-card-header">
                        <span className="sf-card-title">OEE — {SERIAL}</span>
                        {online
                            ? <span className="badge badge-live">● LIVE</span>
                            : <span className="badge badge-offline">✕ OFFLINE</span>
                        }
                    </div>
                    <div className="sf-card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                        <OEEGauge value={oee?.oee ?? 0} size={160} />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, width: "100%" }}>
                            {[
                                ["DISP.", oee?.disponibilidade, "var(--info)"],
                                ["PERF.", oee?.performance, "var(--green)"],
                                ["QUAL.", oee?.qualidade, "var(--primary)"],
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

                {/* Sistema de Pesagem */}
                <div className="sf-card">
                    <div className="sf-card-header">
                        <span className="sf-card-title">Sistema de Pesagem</span>
                        <span className={`chip chip-${pesos.estavel ? "green" : "orange"}`}>
                            {pesos.estavel ? "ESTÁVEL" : "AGUARDANDO"}
                        </span>
                    </div>
                    <div className="sf-card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                        {/* Peso atual */}
                        <div style={{ textAlign: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text3)", letterSpacing: 2, marginBottom: 4 }}>PESO LÍQUIDO</div>
                            <div style={{
                                fontFamily: "var(--font-display)", fontSize: 52, fontWeight: 800,
                                color: pesos.estavel ? "var(--green)" : "var(--text3)", lineHeight: 1,
                            }}>
                                {((pesos.liq_scaime ?? 0) / 10).toFixed(3)}
                            </div>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text3)", marginTop: 4 }}>kg</div>
                        </div>

                        {/* Estatísticas CEP */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                            {[
                                ["Mínimo", ((pesos.min ?? 0)).toFixed(1) + "g", (pesos.min ?? 0) > 0 ? "var(--green)" : "var(--text3)"],
                                ["Média", ((pesos.media ?? 0)).toFixed(1) + "g", "var(--primary)"],
                                ["Máximo", ((pesos.max ?? 0)).toFixed(1) + "g", (pesos.max ?? 0) > 0 ? "var(--orange)" : "var(--text3)"],
                            ].map(([l, v, c]) => (
                                <div key={l} style={{ background: "var(--bg1)", padding: "8px 10px", borderRadius: 6, border: "1px solid var(--border)" }}>
                                    <div style={{ fontSize: 10, color: "var(--text3)", fontWeight: 600, textTransform: "uppercase" }}>{l}</div>
                                    <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: c, marginTop: 2 }}>{v}</div>
                                </div>
                            ))}
                        </div>

                        {/* OK / NOK */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            <div style={{ padding: "10px 14px", background: "rgba(45,154,78,.08)", border: "1px solid var(--green)", borderRadius: 6 }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--green)", textTransform: "uppercase" }}>Pacotes OK</div>
                                <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--green)" }}>
                                    {ok.toLocaleString("pt-BR")}
                                </div>
                            </div>
                            <div style={{ padding: "10px 14px", background: "rgba(220,53,69,.08)", border: "1px solid var(--red)", borderRadius: 6 }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--red)", textTransform: "uppercase" }}>Pacotes NOK</div>
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
                    {getMachineStateChip(machineState)}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 0 }}>
                    {[
                        ["Velocidade", (status.vel ?? "—") + " rpm", "var(--info)"],
                        [
                            "Pacotes/min",
                            status.pac_min ?? "—",
                            "var(--primary)"
                        ],
                        [
                            "Modo",

                            status.ciclo === 1
                                ?
                                "RODANDO"
                                :
                                "PARADA",

                            status.ciclo === 1
                                ?
                                "var(--green)"
                                :
                                "var(--orange)"
                        ],
                        [
                            "Turno Atual",

                            turno.t1 > 0
                                ?
                                "Turno 1"

                                :

                                turno.t2 > 0
                                    ?
                                    "Turno 2"

                                    :

                                    turno.t3 > 0
                                        ?
                                        "Turno 3"

                                        :

                                        "—",

                            "var(--text)"
                        ],
                        ["Total Geral", (status.total ?? 0).toLocaleString("pt-BR") + " un", "var(--text)"],
                    ].map(([l, v, c], i) => (
                        <div key={l} style={{ padding: "16px 20px", borderRight: i < 4 ? "1px solid var(--border)" : "none" }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", marginBottom: 6 }}>{l}</div>
                            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: c }}>{v}</div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}