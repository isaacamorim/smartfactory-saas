// src/components/Navbar.jsx
import { useState, useEffect } from "react";
import { MACHINES } from "../data/mockData";
import { checkHealth } from "../services/mqttData";

const PAGE_LABELS = {
    dashboard: "Dashboard", oee: "OEE", maquinas: "Máquinas", linhas: "Linhas",
    producao: "Produção", alarmes: "Alarmes", manutencao: "Manutenção",
    empresas: "Empresas", usuarios: "Usuários", metas: "Metas OEE",
    parametros: "Parâmetros CLP",
};

const ROLE_LABELS = { admin: "Administrador", gerente: "Gerente", operador: "Operador" };
const ROLE_COLORS = { admin: "var(--primary)", gerente: "var(--info)", operador: "var(--green)" };

function ServiceDot({ label, ok, checking }) {
    const color = checking ? "var(--text3)" : ok ? "var(--green)" : "var(--red)";
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: 4,
            padding: "3px 8px", borderRadius: 99,
            background: checking ? "var(--bg2)" : ok ? "rgba(45,154,78,.1)" : "rgba(220,53,69,.1)",
            border: `1px solid ${color}44`,
            cursor: "default",
        }}
            title={checking ? "Verificando..." : ok ? `${label} online` : `${label} offline`}
        >
            <span style={{
                width: 5, height: 5, borderRadius: "50%", background: color,
                display: "inline-block",
                animation: ok && !checking ? "blink 2s infinite" : "none",
            }} />
            <span style={{
                fontFamily: "var(--font-mono)", fontSize: 9,
                fontWeight: 600, color, letterSpacing: .5
            }}>
                {label}
            </span>
        </div>
    );
}

export default function Navbar({ page, usuario, onLogout }) {
    const [health, setHealth] = useState({ api: false, influx: false, mqtt: false });
    const [checking, setChecking] = useState(true);
    const now = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const role = usuario?.role ?? "operador";

    useEffect(() => {
        async function check() {
            setChecking(true);
            const h = await checkHealth();
            setHealth(h);
            setChecking(false);
        }
        check();
        // Verifica a cada 30 segundos — não a cada render
        const t = setInterval(check, 30_000);
        return () => clearInterval(t);
    }, []);

    return (
        <header style={{
            height: 50, background: "#fff", borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", padding: "0 20px", gap: 12, zIndex: 10,
        }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text3)", flex: 1 }}>
                SmartFactory /&nbsp;
                <span style={{ color: "var(--primary)", fontWeight: 600 }}>{PAGE_LABELS[page] ?? page}</span>
            </div>

            {/* Ticker máquinas */}
            <div style={{
                overflow: "hidden", width: 280, borderLeft: "1px solid var(--border)",
                borderRight: "1px solid var(--border)", padding: "0 12px"
            }}>
                <div style={{
                    display: "inline-block", whiteSpace: "nowrap",
                    fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text3)",
                    animation: "ticker-scroll 24s linear infinite"
                }}>
                    {MACHINES.map(m => (
                        <span key={m.serial} style={{ marginRight: 28 }}>
                            <span style={{ color: m.status === "online" ? "var(--green)" : "var(--red)" }}>
                                {m.serial} ● {m.status === "online" ? "ONLINE" : "PARADA"}
                            </span>
                            {m.status === "online" && <span> ● OEE {m.oee}%</span>}
                        </span>
                    ))}
                </div>
            </div>

            {/* Status real dos serviços */}
            <div style={{ display: "flex", gap: 5 }}>
                <ServiceDot label="MQTT" ok={health.mqtt} checking={checking} />
                <ServiceDot label="INFLUX" ok={health.influx} checking={checking} />
                <ServiceDot label="API" ok={health.api} checking={checking} />
            </div>

            <div style={{
                fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text2)",
                borderLeft: "1px solid var(--border)", paddingLeft: 12
            }}>{now}</div>

            {/* User */}
            <div style={{ display: "flex", gap: 8, alignItems: "center", borderLeft: "1px solid var(--border)", paddingLeft: 12 }}>
                <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{usuario?.nome ?? "—"}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: ROLE_COLORS[role] }}>
                        {ROLE_LABELS[role]}
                        {usuario?.empresa_id && <span style={{ color: "var(--text3)" }}> · emp #{usuario.empresa_id}</span>}
                    </div>
                </div>
                <div style={{
                    width: 30, height: 30, borderRadius: 6, background: "var(--primary)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, color: "#fff", fontFamily: "var(--font-display)",
                }}>{(usuario?.nome ?? "AD").slice(0, 2).toUpperCase()}</div>
                <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 11 }} onClick={onLogout}>Sair</button>
            </div>
        </header>
    );
}
