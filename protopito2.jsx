import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────
//  DESIGN TOKENS
// ─────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&family=Barlow+Condensed:wght@300;400;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg0: #060a0e;
    --bg1: #0b1017;
    --bg2: #101820;
    --bg3: #162030;
    --border: #1c2d3f;
    --border2: #243650;
    --cyan:   #00e5ff;
    --cyan2:  #009ec2;
    --green:  #00e676;
    --orange: #ff9100;
    --red:    #ff3d3d;
    --yellow: #ffd740;
    --blue:   #448aff;
    --text:   #b8cdd8;
    --text2:  #607080;
    --text3:  #344555;
  }

  body { background: var(--bg0); color: var(--text); font-family: 'Barlow Condensed', sans-serif; overflow: hidden; }

  ::-webkit-scrollbar { width: 3px; height: 3px; }
  ::-webkit-scrollbar-track { background: var(--bg1); }
  ::-webkit-scrollbar-thumb { background: var(--border2); }

  .mono { font-family: 'Share Tech Mono', monospace; }
  .rajd { font-family: 'Rajdhani', sans-serif; }
  .barlow { font-family: 'Barlow Condensed', sans-serif; }

  /* scanlines */
  .scanlines::after {
    content: '';
    position: fixed; inset: 0; pointer-events: none; z-index: 9999;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.025) 2px, rgba(0,0,0,0.025) 4px);
  }

  /* grid bg */
  .gridbg {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      linear-gradient(rgba(0,229,255,0.022) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,229,255,0.022) 1px, transparent 1px);
    background-size: 44px 44px;
  }

  /* glow effects */
  .glow-c { box-shadow: 0 0 18px rgba(0,229,255,0.25); }
  .glow-g { box-shadow: 0 0 18px rgba(0,230,118,0.25); }
  .glow-r { box-shadow: 0 0 18px rgba(255,61,61,0.25); }

  /* blink */
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.25} }
  @keyframes pulse-ring { 0%{transform:scale(1);opacity:1} 100%{transform:scale(2.2);opacity:0} }
  @keyframes slideUp { from{transform:translateY(12px);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes scanH { 0%,100%{opacity:.2} 50%{opacity:.7} }
  @keyframes march { from{background-position:0 0} to{background-position:40px 0} }
  @keyframes spinSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

  .animate-up { animation: slideUp 0.35s ease both; }
  .animate-fade { animation: fadeIn 0.3s ease both; }

  /* hex clip */
  .hex { clip-path: polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%); }

  /* input */
  .sf-input {
    width: 100%;
    background: var(--bg3);
    border: 1px solid var(--border2);
    color: #fff;
    padding: 10px 14px;
    font-family: 'Share Tech Mono', monospace;
    font-size: 12px;
    letter-spacing: 1px;
    outline: none;
    transition: border-color .2s, box-shadow .2s;
  }
  .sf-input:focus { border-color: var(--cyan); box-shadow: 0 0 0 2px rgba(0,229,255,.1); }
  .sf-input::placeholder { color: var(--text3); }

  /* select */
  .sf-select {
    width: 100%;
    background: var(--bg3);
    border: 1px solid var(--border2);
    color: #fff;
    padding: 10px 14px;
    font-family: 'Share Tech Mono', monospace;
    font-size: 12px;
    letter-spacing: 1px;
    outline: none;
    cursor: pointer;
    appearance: none;
  }
  .sf-select:focus { border-color: var(--cyan); }

  /* btn */
  .btn { cursor: pointer; transition: all .2s; font-family: 'Rajdhani', sans-serif; font-weight: 700; letter-spacing: 2px; border: none; }
  .btn-primary {
    background: transparent;
    border: 1px solid var(--cyan);
    color: var(--cyan);
    padding: 9px 20px;
    font-size: 13px;
    text-transform: uppercase;
  }
  .btn-primary:hover { background: rgba(0,229,255,.1); box-shadow: 0 0 16px rgba(0,229,255,.2); }
  .btn-danger {
    background: transparent;
    border: 1px solid var(--red);
    color: var(--red);
    padding: 9px 20px;
    font-size: 13px;
    text-transform: uppercase;
  }
  .btn-danger:hover { background: rgba(255,61,61,.1); }
  .btn-ghost {
    background: transparent;
    border: 1px solid var(--border2);
    color: var(--text2);
    padding: 9px 20px;
    font-size: 13px;
    text-transform: uppercase;
  }
  .btn-ghost:hover { border-color: var(--text); color: var(--text); }
  .btn-solid {
    background: var(--cyan);
    border: 1px solid var(--cyan);
    color: var(--bg0);
    padding: 10px 24px;
    font-size: 14px;
    text-transform: uppercase;
  }
  .btn-solid:hover { background: #00ccee; box-shadow: 0 0 20px rgba(0,229,255,.4); }

  /* card */
  .sf-card {
    background: var(--bg1);
    border: 1px solid var(--border);
    position: relative;
    overflow: hidden;
  }
  .sf-card-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid var(--border);
  }
  .sf-card-title {
    font-family: 'Rajdhani', sans-serif;
    font-size: 13px; font-weight: 700;
    letter-spacing: 2.5px; text-transform: uppercase; color: #fff;
  }
  .sf-card-body { padding: 20px; }

  /* badge */
  .badge {
    font-family: 'Share Tech Mono', monospace;
    font-size: 9px; letter-spacing: 2px; padding: 3px 8px;
    border: 1px solid currentColor;
    text-transform: uppercase;
  }
  .badge-live { color: var(--green); animation: blink 2s infinite; }
  .badge-warn { color: var(--orange); }
  .badge-error { color: var(--red); }
  .badge-info { color: var(--cyan); }

  /* status chip */
  .chip {
    display: inline-flex; align-items: center; gap: 5px;
    font-family: 'Share Tech Mono', monospace;
    font-size: 9px; letter-spacing: 1.5px;
    padding: 3px 8px; border: 1px solid currentColor;
    text-transform: uppercase;
  }
  .chip::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
  .chip-green { color: var(--green); }
  .chip-green::before { animation: blink 1.5s infinite; }
  .chip-red { color: var(--red); }
  .chip-orange { color: var(--orange); }
  .chip-gray { color: var(--text3); }

  /* table */
  .sf-table { width: 100%; border-collapse: collapse; }
  .sf-table thead tr { background: var(--bg2); border-bottom: 1px solid var(--border2); }
  .sf-table th {
    text-align: left; padding: 11px 16px;
    font-family: 'Share Tech Mono', monospace;
    font-size: 9px; letter-spacing: 3px; color: var(--text3);
  }
  .sf-table tbody tr { border-bottom: 1px solid var(--border); transition: background .15s; cursor: pointer; }
  .sf-table tbody tr:hover { background: rgba(0,229,255,.03); }
  .sf-table td { padding: 13px 16px; font-size: 13px; color: var(--text); }
  .sf-table .serial { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: var(--cyan); letter-spacing: 1px; }

  /* sidebar top accent */
  .sidebar-accent {
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent 0%, var(--cyan) 50%, transparent 100%);
    animation: scanH 3s ease-in-out infinite;
  }

  /* progress */
  .prog-track { height: 5px; background: var(--border2); overflow: hidden; }
  .prog-fill { height: 100%; transition: width 1.2s ease; }

  /* mini spark */
  .spark { overflow: visible; }
`;

// ─────────────────────────────────────────────
//  MOCK DATA
// ─────────────────────────────────────────────
const MACHINES = [
    { id: 1, serial: "EVA1000-00021", modelo: "EVA1000", empresa: "NH Alimentos", linha: "Linha 01", status: "online", vel: 42, oee: 75.3, boas: 4821, ruins: 89, peso: 500, turno: "Carlos M." },
    { id: 2, serial: "EVA1000-00022", modelo: "EVA1000", empresa: "NH Alimentos", linha: "Linha 02", status: "offline", vel: 0, oee: 0, boas: 2100, ruins: 0, peso: 0, turno: "—" },
    { id: 3, serial: "EVA1000-00023", modelo: "EVA1000", empresa: "NH Alimentos", linha: "Linha 03", status: "online", vel: 38, oee: 81.2, boas: 4990, ruins: 44, peso: 500, turno: "Marcos P." },
];

const ALARMS = [
    { id: 1, sev: "critical", nome: "Parada por falha mecânica", maquina: "EVA1000-00022", linha: "Linha 02", hora: "08:42", ativo: true },
    { id: 2, sev: "warn", nome: "Peso fora do padrão (>505g)", maquina: "EVA1000-00021", linha: "Linha 01", hora: "09:15", ativo: true },
    { id: 3, sev: "info", nome: "Troca de operador registrada", maquina: "EVA1000-00021", linha: "Linha 01", hora: "07:00", ativo: false },
    { id: 4, sev: "info", nome: "Parâmetro de velocidade alterado", maquina: "EVA1000-00023", linha: "Linha 03", hora: "06:45", ativo: false },
    { id: 5, sev: "warn", nome: "Temperatura do motor elevada", maquina: "EVA1000-00021", linha: "Linha 01", hora: "10:02", ativo: true },
];

const MANUTENCAO = [
    { id: 1, serial: "EVA1000-00022", tipo: "Corretiva", descricao: "Falha na correia de transmissão", tecnico: "João S.", inicio: "08:42", fim: "—", status: "aberta" },
    { id: 2, serial: "EVA1000-00021", tipo: "Preventiva", descricao: "Lubrificação dos rolamentos", tecnico: "Pedro A.", inicio: "06:00", fim: "06:30", status: "concluida" },
    { id: 3, serial: "EVA1000-00023", tipo: "Preventiva", descricao: "Calibração de sensores de peso", tecnico: "Pedro A.", inicio: "05:45", fim: "06:20", status: "concluida" },
];

// ─────────────────────────────────────────────────────────────────────────────
//  COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// ── Sidebar ──────────────────────────────────
function Sidebar({ page, setPage }) {
    const nav = [
        { section: "OPERAÇÃO" },
        { id: "dashboard", icon: "◈", label: "Dashboard" },
        { id: "oee", icon: "◎", label: "OEE" },
        { id: "maquinas", icon: "⬡", label: "Máquinas", badge: 3, badgeColor: "var(--green)" },
        { id: "producao", icon: "≋", label: "Produção" },
        { id: "alarmes", icon: "△", label: "Alarmes", badge: 2, badgeColor: "var(--red)" },
        { id: "manutencao", icon: "⚙", label: "Manutenção" },
        { section: "ADMIN" },
        { id: "empresas", icon: "⬜", label: "Empresas" },
        { id: "usuarios", icon: "◻", label: "Usuários" },
        { id: "metas", icon: "✦", label: "Metas OEE" },
    ];

    return (
        <aside style={{ width: 220, minWidth: 220, background: "var(--bg1)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", zIndex: 10 }}>
            <div className="sidebar-accent" />

            {/* Logo */}
            <div style={{ padding: "22px 18px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <div className="hex" style={{ width: 34, height: 34, background: "var(--cyan)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: "var(--bg0)", fontFamily: "Rajdhani" }}>SF</div>
                    <span className="rajd" style={{ fontSize: 17, fontWeight: 700, letterSpacing: 2, color: "#fff" }}>SMART FACTORY</span>
                </div>
                <div className="mono" style={{ fontSize: 9, letterSpacing: 3, color: "var(--cyan)", paddingLeft: 44 }}>IIoT PLATFORM</div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: "10px 0", overflowY: "auto" }}>
                {nav.map((item, i) => item.section
                    ? <div key={i} className="mono" style={{ padding: "14px 18px 4px", fontSize: 9, letterSpacing: 3, color: "var(--text3)" }}>{item.section}</div>
                    : (
                        <div key={item.id}
                            onClick={() => setPage(item.id)}
                            style={{
                                display: "flex", alignItems: "center", gap: 10,
                                padding: "10px 18px", cursor: "pointer",
                                background: page === item.id ? "rgba(0,229,255,0.07)" : "transparent",
                                borderLeft: page === item.id ? "3px solid var(--cyan)" : "3px solid transparent",
                                color: page === item.id ? "#fff" : "var(--text2)",
                                fontSize: 14, fontWeight: 600, letterSpacing: 1,
                                transition: "all .15s", position: "relative"
                            }}
                        >
                            <span style={{ width: 18, textAlign: "center", fontSize: 13, opacity: page === item.id ? 1 : 0.6 }}>{item.icon}</span>
                            {item.label}
                            {item.badge && (
                                <span style={{ marginLeft: "auto", background: "transparent", border: `1px solid ${item.badgeColor}`, color: item.badgeColor, fontSize: 9, padding: "2px 7px", fontFamily: "Share Tech Mono" }}>{item.badge}</span>
                            )}
                        </div>
                    )
                )}
            </nav>

            {/* Footer */}
            <div style={{ padding: "14px 18px", borderTop: "1px solid var(--border)" }}>
                <div className="mono" style={{ fontSize: 10, color: "var(--text3)", marginBottom: 4 }}>
                    <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--green)", marginRight: 6, animation: "blink 2s infinite" }} />
                    SISTEMA ONLINE
                </div>
                <div className="mono" style={{ fontSize: 10, color: "var(--text3)" }}>191.252.217.250</div>
            </div>
        </aside>
    );
}

// ── Navbar ────────────────────────────────────
function Navbar({ page, user, setPage }) {
    const labels = { dashboard: "Dashboard", oee: "OEE", maquinas: "Máquinas", producao: "Produção", alarmes: "Alarmes", manutencao: "Manutenção", empresas: "Empresas", usuarios: "Usuários", metas: "Metas OEE" };
    const now = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    return (
        <header style={{ height: 52, background: "var(--bg1)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 24px", gap: 14, zIndex: 10 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: 2, color: "var(--text3)", flex: 1 }}>
                SMARTFACTORY / <span style={{ color: "var(--cyan)" }}>{labels[page]?.toUpperCase()}</span>
            </div>

            {/* Ticker */}
            <div style={{ display: "flex", gap: 12 }}>
                {[
                    { label: "MQTT", color: "var(--green)" },
                    { label: "INFLUX", color: "var(--green)" },
                    { label: "API", color: "var(--green)" },
                ].map(s => (
                    <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, display: "inline-block", animation: "blink 2s infinite" }} />
                        <span className="mono" style={{ fontSize: 9, letterSpacing: 1, color: s.color }}>{s.label}</span>
                    </div>
                ))}
            </div>

            <div className="mono" style={{ fontSize: 10, color: "var(--text2)", borderLeft: "1px solid var(--border)", paddingLeft: 14 }}>{now}</div>

            <div style={{ display: "flex", gap: 8, alignItems: "center", borderLeft: "1px solid var(--border)", paddingLeft: 14 }}>
                <div className="mono" style={{ fontSize: 10, color: "var(--text2)" }}>{user?.nome || "ADMIN"}</div>
                <div className="hex" style={{ width: 30, height: 30, background: "linear-gradient(135deg,var(--cyan2),#005577)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--bg0)", cursor: "pointer" }}>
                    {(user?.nome || "AD").slice(0, 2).toUpperCase()}
                </div>
                <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 10 }} onClick={() => setPage("login")}>SAIR</button>
            </div>
        </header>
    );
}

// ── Table ─────────────────────────────────────
function Table({ columns, data, onRowClick }) {
    return (
        <div style={{ overflowX: "auto" }}>
            <table className="sf-table">
                <thead>
                    <tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}</tr>
                </thead>
                <tbody>
                    {data.map((row, i) => (
                        <tr key={i} onClick={() => onRowClick?.(row)}>
                            {columns.map(c => (
                                <td key={c.key}>{c.render ? c.render(row[c.key], row) : row[c.key]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ── Form ──────────────────────────────────────
function Form({ fields, onSubmit, onCancel, title }) {
    const [values, setValues] = useState(() => Object.fromEntries(fields.map(f => [f.name, f.default || ""])));

    return (
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border2)", padding: 28 }}>
            {title && <div className="rajd" style={{ fontSize: 16, fontWeight: 700, letterSpacing: 2, color: "#fff", textTransform: "uppercase", marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 14 }}>{title}</div>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {fields.map(f => (
                    <div key={f.name} style={{ gridColumn: f.full ? "1/-1" : "auto" }}>
                        <div className="mono" style={{ fontSize: 9, letterSpacing: 2, color: "var(--text3)", marginBottom: 6 }}>{f.label}</div>
                        {f.type === "select"
                            ? <select className="sf-select" value={values[f.name]} onChange={e => setValues(v => ({ ...v, [f.name]: e.target.value }))}>
                                {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                            : <input className="sf-input" type={f.type || "text"} placeholder={f.placeholder || ""} value={values[f.name]} onChange={e => setValues(v => ({ ...v, [f.name]: e.target.value }))} />
                        }
                    </div>
                ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
                {onCancel && <button className="btn btn-ghost" onClick={onCancel}>CANCELAR</button>}
                <button className="btn btn-solid" onClick={() => onSubmit(values)}>SALVAR</button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
//  PAGES
// ─────────────────────────────────────────────────────────────────────────────

// ── LOGIN ─────────────────────────────────────
function LoginPage({ onLogin }) {
    const [email, setEmail] = useState("admin@smartfactory.com");
    const [senha, setSenha] = useState("••••••••");
    const [loading, setLoading] = useState(false);

    const handleLogin = () => {
        setLoading(true);
        setTimeout(() => { setLoading(false); onLogin({ nome: "Admin", email }); }, 1200);
    };

    return (
        <div style={{ width: "100vw", height: "100vh", display: "flex", background: "var(--bg0)", position: "relative", overflow: "hidden" }}>
            <div className="gridbg" />

            {/* Left decorative panel */}
            <div style={{ width: "45%", background: "var(--bg1)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 60, position: "relative", overflow: "hidden" }}>
                {/* Animated corner brackets */}
                {["tl", "tr", "bl", "br"].map(pos => (
                    <div key={pos} style={{
                        position: "absolute",
                        [pos.includes("t") ? "top" : "bottom"]: 24,
                        [pos.includes("l") ? "left" : "right"]: 24,
                        width: 32, height: 32,
                        borderTop: pos.includes("t") ? "2px solid var(--cyan)" : "none",
                        borderBottom: pos.includes("b") ? "2px solid var(--cyan)" : "none",
                        borderLeft: pos.includes("l") ? "2px solid var(--cyan)" : "none",
                        borderRight: pos.includes("r") ? "2px solid var(--cyan)" : "none",
                        opacity: 0.5
                    }} />
                ))}

                {/* Big OEE visualization */}
                <svg width="240" height="240" viewBox="0 0 240 240" style={{ marginBottom: 32 }}>
                    {/* Outer ring */}
                    <circle cx="120" cy="120" r="110" fill="none" stroke="var(--border2)" strokeWidth="1" />
                    <circle cx="120" cy="120" r="100" fill="none" stroke="var(--border)" strokeWidth="8" />
                    <circle cx="120" cy="120" r="100" fill="none" stroke="var(--cyan)" strokeWidth="8"
                        strokeDasharray="628" strokeDashoffset="157"
                        strokeLinecap="round"
                        style={{ filter: "drop-shadow(0 0 8px var(--cyan))", transform: "rotate(-90deg)", transformOrigin: "120px 120px" }} />
                    {/* Middle ring */}
                    <circle cx="120" cy="120" r="78" fill="none" stroke="var(--border)" strokeWidth="5" />
                    <circle cx="120" cy="120" r="78" fill="none" stroke="var(--green)" strokeWidth="5"
                        strokeDasharray="490" strokeDashoffset="44"
                        strokeLinecap="round"
                        style={{ filter: "drop-shadow(0 0 6px var(--green))", transform: "rotate(-90deg)", transformOrigin: "120px 120px" }} />
                    {/* Inner ring */}
                    <circle cx="120" cy="120" r="58" fill="none" stroke="var(--border)" strokeWidth="4" />
                    <circle cx="120" cy="120" r="58" fill="none" stroke="var(--yellow)" strokeWidth="4"
                        strokeDasharray="364" strokeDashoffset="7"
                        strokeLinecap="round"
                        style={{ filter: "drop-shadow(0 0 5px var(--yellow))", transform: "rotate(-90deg)", transformOrigin: "120px 120px" }} />
                    {/* Center text */}
                    <text x="120" y="112" textAnchor="middle" fontFamily="Rajdhani" fontSize="40" fontWeight="700" fill="#fff">75.3</text>
                    <text x="120" y="132" textAnchor="middle" fontFamily="Share Tech Mono" fontSize="11" fill="var(--text3)" letterSpacing="3">OEE %</text>
                    {/* Labels */}
                    <text x="120" y="172" textAnchor="middle" fontFamily="Share Tech Mono" fontSize="9" fill="var(--cyan)" letterSpacing="2">DISP · PERF · QUAL</text>
                </svg>

                <div className="rajd" style={{ fontSize: 28, fontWeight: 700, letterSpacing: 4, color: "#fff", textAlign: "center", marginBottom: 8 }}>SMART FACTORY</div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: 4, color: "var(--cyan)", textAlign: "center", marginBottom: 28 }}>INDUSTRIAL MONITORING PLATFORM</div>

                <div style={{ display: "flex", gap: 32 }}>
                    {[["3", "MÁQUINAS"], ["75.3%", "OEE MÉDIO"], ["4.821", "PRODUÇÃO"]].map(([v, l]) => (
                        <div key={l} style={{ textAlign: "center" }}>
                            <div className="rajd" style={{ fontSize: 24, fontWeight: 700, color: "#fff" }}>{v}</div>
                            <div className="mono" style={{ fontSize: 9, letterSpacing: 2, color: "var(--text3)" }}>{l}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right login form */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 60 }}>
                <div style={{ width: 360 }} className="animate-up">
                    <div style={{ marginBottom: 36 }}>
                        <div className="rajd" style={{ fontSize: 22, fontWeight: 700, letterSpacing: 3, color: "#fff", marginBottom: 6 }}>ACESSAR PLATAFORMA</div>
                        <div className="mono" style={{ fontSize: 10, letterSpacing: 2, color: "var(--text3)" }}>SMART FACTORY — v1.0.0</div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <div className="mono" style={{ fontSize: 9, letterSpacing: 2, color: "var(--text3)", marginBottom: 6 }}>EMAIL</div>
                        <input className="sf-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" />
                    </div>

                    <div style={{ marginBottom: 28 }}>
                        <div className="mono" style={{ fontSize: 9, letterSpacing: 2, color: "var(--text3)", marginBottom: 6 }}>SENHA</div>
                        <input className="sf-input" type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" />
                    </div>

                    <button className="btn btn-solid" style={{ width: "100%", padding: 13, fontSize: 15 }} onClick={handleLogin}>
                        {loading ? "AUTENTICANDO..." : "ENTRAR"}
                    </button>

                    {loading && (
                        <div style={{ marginTop: 16 }}>
                            <div style={{ height: 2, background: "var(--border2)", overflow: "hidden" }}>
                                <div style={{ height: "100%", background: "linear-gradient(90deg,var(--cyan),var(--green))", animation: "march .8s linear infinite", backgroundSize: "40px 100%" }} />
                            </div>
                        </div>
                    )}

                    <div className="mono" style={{ fontSize: 10, letterSpacing: 1, color: "var(--text3)", textAlign: "center", marginTop: 28 }}>
                        Plataforma Industrial IIoT · NH Alimentos
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── DASHBOARD ─────────────────────────────────
function DashboardPage() {
    const [tick, setTick] = useState(0);
    useEffect(() => { const t = setInterval(() => setTick(x => x + 1), 4000); return () => clearInterval(t); }, []);
    const oee = (74 + Math.sin(tick * 0.8) * 2.5).toFixed(1);

    const StatCard = ({ label, value, unit, delta, deltaPos, accent }) => (
        <div className="sf-card animate-up" style={{ padding: 20, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: accent, opacity: .7 }} />
            <div className="mono" style={{ fontSize: 9, letterSpacing: 3, color: "var(--text3)", marginBottom: 12, textTransform: "uppercase" }}>{label}</div>
            <div className="rajd" style={{ fontSize: 40, fontWeight: 700, color: "#fff", lineHeight: 1 }}>
                {value}<span style={{ fontSize: 16, color: "var(--text2)", fontWeight: 400, marginLeft: 4 }}>{unit}</span>
            </div>
            <div className="mono" style={{ fontSize: 10, color: deltaPos ? "var(--green)" : "var(--red)", marginTop: 8 }}>{delta}</div>
        </div>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <div className="rajd" style={{ fontSize: 28, fontWeight: 700, letterSpacing: 3, color: "#fff", textTransform: "uppercase" }}>Dashboard Industrial</div>
                    <div className="mono" style={{ fontSize: 10, color: "var(--text3)", letterSpacing: 2, marginTop: 4 }}>TURNO 06:00–14:00 · 3 MÁQUINAS · {new Date().toLocaleDateString("pt-BR")}</div>
                </div>
                <button className="btn btn-primary">+ NOVA MÁQUINA</button>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
                <StatCard label="OEE Médio — Turno" value={oee} unit="%" delta="▲ +3.1% vs turno anterior" deltaPos accent="var(--cyan)" />
                <StatCard label="Produção Total" value="4.821" unit="un" delta="Meta: 5.200 un (92%)" deltaPos accent="var(--green)" />
                <StatCard label="Pacotes Reprovados" value="89" unit="un" delta="▲ +12 vs média do turno" deltaPos={false} accent="var(--orange)" />
                <StatCard label="Alarmes Ativos" value="2" unit="" delta="EVA1000-00022 parada" deltaPos={false} accent="var(--red)" />
            </div>

            {/* OEE + Alarms */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {/* OEE Gauge */}
                <div className="sf-card">
                    <div className="sf-card-header"><span className="sf-card-title">OEE — EVA1000-00021</span><span className="badge badge-live">● LIVE</span></div>
                    <div className="sf-card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
                        <svg width="170" height="170" viewBox="0 0 170 170">
                            <circle cx="85" cy="85" r="75" fill="none" stroke="var(--border2)" strokeWidth="10" />
                            <circle cx="85" cy="85" r="75" fill="none" stroke="var(--cyan)" strokeWidth="10"
                                strokeDasharray="471" strokeDashoffset={471 * (1 - parseFloat(oee) / 100)}
                                strokeLinecap="round" style={{ filter: "drop-shadow(0 0 8px var(--cyan))", transform: "rotate(-90deg)", transformOrigin: "85px 85px", transition: "stroke-dashoffset .8s ease" }} />
                            <text x="85" y="78" textAnchor="middle" fontFamily="Rajdhani" fontSize="36" fontWeight="700" fill="#fff">{oee}</text>
                            <text x="85" y="96" textAnchor="middle" fontFamily="Share Tech Mono" fontSize="9" fill="var(--text3)" letterSpacing="3">OEE %</text>
                        </svg>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, width: "100%" }}>
                            {[["DISP.", "88.1%", "var(--cyan)", 88], ["PERF.", "91.4%", "var(--green)", 91], ["QUAL.", "98.2%", "var(--yellow)", 98]].map(([l, v, c, p]) => (
                                <div key={l} style={{ background: "var(--bg2)", border: "1px solid var(--border)", padding: "10px 12px", textAlign: "center" }}>
                                    <div className="mono" style={{ fontSize: 9, letterSpacing: 2, color: "var(--text3)", marginBottom: 6 }}>{l}</div>
                                    <div className="rajd" style={{ fontSize: 20, fontWeight: 700, color: c }}>{v}</div>
                                    <div className="prog-track" style={{ marginTop: 6 }}><div className="prog-fill" style={{ width: `${p}%`, background: c }} /></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Alarms */}
                <div className="sf-card">
                    <div className="sf-card-header"><span className="sf-card-title">Alarmes Ativos</span><span className="badge badge-warn">2 ATIVOS</span></div>
                    <div className="sf-card-body" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        {ALARMS.slice(0, 5).map(a => (
                            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                                <div style={{ width: 4, height: 34, background: a.sev === "critical" ? "var(--red)" : a.sev === "warn" ? "var(--orange)" : "var(--cyan)", boxShadow: a.sev === "critical" ? "0 0 8px var(--red)" : a.sev === "warn" ? "0 0 8px var(--orange)" : "none" }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: "#fff", marginBottom: 2 }}>{a.nome}</div>
                                    <div className="mono" style={{ fontSize: 10, color: "var(--text3)" }}>{a.maquina} · {a.linha}</div>
                                </div>
                                <div className="mono" style={{ fontSize: 9, color: "var(--text3)" }}>{a.hora}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Machine table */}
            <div className="sf-card">
                <div className="sf-card-header"><span className="sf-card-title">Máquinas — Status</span><span className="badge badge-live">● TEMPO REAL</span></div>
                <Table
                    columns={[
                        { key: "serial", label: "Serial", render: v => <span className="serial">{v}</span> },
                        { key: "modelo", label: "Modelo" },
                        { key: "linha", label: "Linha" },
                        { key: "status", label: "Status", render: v => <span className={`chip chip-${v === "online" ? "green" : "red"}`}>{v === "online" ? "RODANDO" : "PARADA"}</span> },
                        { key: "vel", label: "Velocidade", render: v => `${v} pct/min` },
                        {
                            key: "oee", label: "OEE", render: (v) => (
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ flex: 1, height: 4, background: "var(--border2)", overflow: "hidden" }}>
                                        <div style={{ height: "100%", width: `${v}%`, background: v >= 80 ? "var(--green)" : v >= 60 ? "var(--orange)" : "var(--red)", transition: "width 1s" }} />
                                    </div>
                                    <span className="mono" style={{ fontSize: 11, minWidth: 40, textAlign: "right" }}>{v}%</span>
                                </div>
                            )
                        },
                    ]}
                    data={MACHINES}
                />
            </div>
        </div>
    );
}

// ── OEE PAGE ──────────────────────────────────
function OEEPage() {
    const [selected, setSelected] = useState(MACHINES[0]);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <div className="rajd" style={{ fontSize: 28, fontWeight: 700, letterSpacing: 3, color: "#fff", textTransform: "uppercase" }}>Análise OEE</div>
                    <div className="mono" style={{ fontSize: 10, color: "var(--text3)", letterSpacing: 2, marginTop: 4 }}>OVERALL EQUIPMENT EFFECTIVENESS</div>
                </div>
                <select className="sf-select" style={{ width: 220 }} onChange={e => setSelected(MACHINES.find(m => m.serial === e.target.value))}>
                    {MACHINES.map(m => <option key={m.serial} value={m.serial}>{m.serial}</option>)}
                </select>
            </div>

            {/* OEE Big cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
                {[
                    { label: "OEE", value: selected.oee, color: "var(--cyan)", formula: "D × P × Q" },
                    { label: "DISPONIBILIDADE", value: 88.1, color: "var(--cyan)", formula: "Tempo Prod / Tempo Plan" },
                    { label: "PERFORMANCE", value: 91.4, color: "var(--green)", formula: "Prod Real / Prod Teórica" },
                    { label: "QUALIDADE", value: 98.2, color: "var(--yellow)", formula: "Boas / Total Produzido" },
                ].map(item => (
                    <div key={item.label} className="sf-card" style={{ padding: 20 }}>
                        <div className="mono" style={{ fontSize: 9, letterSpacing: 3, color: "var(--text3)", marginBottom: 16 }}>{item.label}</div>
                        <svg width="100%" height="80" viewBox="0 0 180 80">
                            <circle cx="90" cy="90" r="72" fill="none" stroke="var(--border2)" strokeWidth="9" />
                            <circle cx="90" cy="90" r="72" fill="none" stroke={item.color} strokeWidth="9"
                                strokeDasharray="452" strokeDashoffset={452 * (1 - item.value / 100)}
                                strokeLinecap="round"
                                style={{ filter: `drop-shadow(0 0 6px ${item.color})`, transform: "rotate(-90deg)", transformOrigin: "90px 90px" }} />
                            <text x="90" y="96" textAnchor="middle" fontFamily="Rajdhani" fontSize="26" fontWeight="700" fill="#fff">{item.value}%</text>
                        </svg>
                        <div className="prog-track" style={{ marginTop: 12 }}>
                            <div className="prog-fill" style={{ width: `${item.value}%`, background: item.color }} />
                        </div>
                        <div className="mono" style={{ fontSize: 9, color: "var(--text3)", marginTop: 8, letterSpacing: 1 }}>{item.formula}</div>
                    </div>
                ))}
            </div>

            {/* Trend chart placeholder */}
            <div className="sf-card">
                <div className="sf-card-header"><span className="sf-card-title">Histórico OEE — Últimas 8h</span><span className="badge badge-info">EVA1000-00021</span></div>
                <div className="sf-card-body">
                    <svg width="100%" height="140" viewBox="0 0 800 140" preserveAspectRatio="none" style={{ overflow: "visible" }}>
                        {/* Grid lines */}
                        {[0, 25, 50, 75, 100].map(y => (
                            <line key={y} x1="0" y1={140 - y * 1.4} x2="800" y2={140 - y * 1.4} stroke="var(--border)" strokeWidth="1" />
                        ))}
                        {/* OEE line */}
                        <polyline
                            points="0,75 100,68 200,72 300,58 400,62 500,50 600,55 700,45 800,48"
                            fill="none" stroke="var(--cyan)" strokeWidth="2.5"
                            style={{ filter: "drop-shadow(0 0 4px var(--cyan))" }}
                        />
                        <polyline
                            points="0,75 100,68 200,72 300,58 400,62 500,50 600,55 700,45 800,48 800,140 0,140"
                            fill="rgba(0,229,255,0.06)" stroke="none"
                        />
                        {/* Meta line */}
                        <line x1="0" y1={140 - 85 * 1.4} x2="800" y2={140 - 85 * 1.4} stroke="var(--orange)" strokeWidth="1.5" strokeDasharray="8 4" />
                        <text x="805" y={140 - 85 * 1.4 + 4} fontFamily="Share Tech Mono" fontSize="9" fill="var(--orange)">META 85%</text>
                    </svg>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        {["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00"].map(h => (
                            <span key={h} className="mono" style={{ fontSize: 9, color: "var(--text3)" }}>{h}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Meta comparison */}
            <div className="sf-card">
                <div className="sf-card-header"><span className="sf-card-title">Metas vs Realizado</span></div>
                <div className="sf-card-body">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                        {[
                            { label: "Disponibilidade", real: 88.1, meta: 85, color: "var(--cyan)" },
                            { label: "Performance", real: 91.4, meta: 85, color: "var(--green)" },
                            { label: "Qualidade", real: 98.2, meta: 98, color: "var(--yellow)" },
                        ].map(item => (
                            <div key={item.label}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                    <span style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</span>
                                    <span className="mono" style={{ fontSize: 11, color: "var(--text2)" }}>{item.real}% / {item.meta}%</span>
                                </div>
                                <div className="prog-track" style={{ height: 8 }}>
                                    <div className="prog-fill" style={{ width: `${item.real}%`, background: item.color }} />
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                                    <span className="mono" style={{ fontSize: 9, color: "var(--text3)" }}>REALIZADO</span>
                                    <span className="mono" style={{ fontSize: 9, color: "var(--orange)" }}>META: {item.meta}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── MAQUINAS PAGE ─────────────────────────────
function MaquinasPage() {
    const [showForm, setShowForm] = useState(false);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <div className="rajd" style={{ fontSize: 28, fontWeight: 700, letterSpacing: 3, color: "#fff", textTransform: "uppercase" }}>Máquinas</div>
                    <div className="mono" style={{ fontSize: 10, color: "var(--text3)", letterSpacing: 2, marginTop: 4 }}>GERENCIAMENTO DE EQUIPAMENTOS</div>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ CADASTRAR MÁQUINA</button>
            </div>

            {showForm && (
                <div className="animate-up">
                    <Form
                        title="Cadastrar Nova Máquina"
                        fields={[
                            { name: "serial", label: "Serial Number", placeholder: "EVA1000-00045" },
                            { name: "modelo", label: "Modelo", placeholder: "EVA1000" },
                            { name: "empresa", label: "Empresa", type: "select", options: [{ value: "nh", label: "NH Alimentos" }] },
                            { name: "linha", label: "Linha", type: "select", options: [{ value: "l1", label: "Linha 01" }, { value: "l2", label: "Linha 02" }, { value: "l3", label: "Linha 03" }] },
                        ]}
                        onSubmit={(v) => { alert(`Máquina ${v.serial} cadastrada!`); setShowForm(false); }}
                        onCancel={() => setShowForm(false)}
                    />
                </div>
            )}

            {/* Machine cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                {MACHINES.map(m => (
                    <div key={m.id} className="sf-card animate-up">
                        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span className="serial">{m.serial}</span>
                            <span className={`chip chip-${m.status === "online" ? "green" : "red"}`}>{m.status === "online" ? "ONLINE" : "OFFLINE"}</span>
                        </div>
                        <div style={{ padding: 16 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                                {[["MODELO", m.modelo], ["EMPRESA", m.empresa], ["LINHA", m.linha], ["OPERADOR", m.turno]].map(([l, v]) => (
                                    <div key={l}>
                                        <div className="mono" style={{ fontSize: 9, letterSpacing: 2, color: "var(--text3)", marginBottom: 3 }}>{l}</div>
                                        <div style={{ fontSize: 13, fontWeight: 600 }}>{v}</div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                                {[["OEE", `${m.oee}%`, "var(--cyan)"], ["BOAS", m.boas.toLocaleString(), "var(--green)"], ["VEL", `${m.vel}/m`, "var(--text2)"]].map(([l, v, c]) => (
                                    <div key={l} style={{ textAlign: "center" }}>
                                        <div className="mono" style={{ fontSize: 9, letterSpacing: 1, color: "var(--text3)", marginBottom: 4 }}>{l}</div>
                                        <div className="rajd" style={{ fontSize: 20, fontWeight: 700, color: c }}>{v}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Full table */}
            <div className="sf-card">
                <div className="sf-card-header"><span className="sf-card-title">Todas as Máquinas</span></div>
                <Table
                    columns={[
                        { key: "serial", label: "Serial", render: v => <span className="serial">{v}</span> },
                        { key: "modelo", label: "Modelo" },
                        { key: "empresa", label: "Empresa" },
                        { key: "linha", label: "Linha" },
                        { key: "status", label: "Status", render: v => <span className={`chip chip-${v === "online" ? "green" : "red"}`}>{v === "online" ? "ONLINE" : "OFFLINE"}</span> },
                        { key: "oee", label: "OEE", render: v => <span className="mono" style={{ color: v >= 80 ? "var(--green)" : v >= 60 ? "var(--orange)" : "var(--red)" }}>{v}%</span> },
                        { key: "boas", label: "Prod. Total", render: v => v.toLocaleString() },
                        { key: "turno", label: "Operador" },
                    ]}
                    data={MACHINES}
                />
            </div>
        </div>
    );
}

// ── PRODUCAO PAGE ─────────────────────────────
function ProducaoPage() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
                <div className="rajd" style={{ fontSize: 28, fontWeight: 700, letterSpacing: 3, color: "#fff", textTransform: "uppercase" }}>Produção</div>
                <div className="mono" style={{ fontSize: 10, color: "var(--text3)", letterSpacing: 2, marginTop: 4 }}>TURNO ATUAL · TODAS AS LINHAS</div>
            </div>

            {/* Production counters */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                {MACHINES.map(m => (
                    <div key={m.id} className="sf-card animate-up">
                        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
                            <span className="serial">{m.serial}</span>
                            <span className={`chip chip-${m.status === "online" ? "green" : "red"}`}>{m.status === "online" ? "PRODUZINDO" : "PARADA"}</span>
                        </div>
                        <div style={{ padding: 16 }}>
                            {/* Big counter */}
                            <div style={{ textAlign: "center", padding: "16px 0", borderBottom: "1px solid var(--border)", marginBottom: 14 }}>
                                <div className="mono" style={{ fontSize: 9, letterSpacing: 3, color: "var(--text3)", marginBottom: 4 }}>BOAS</div>
                                <div className="rajd" style={{ fontSize: 52, fontWeight: 700, color: "var(--green)", lineHeight: 1 }}>{m.boas.toLocaleString()}</div>
                                <div className="mono" style={{ fontSize: 9, letterSpacing: 2, color: "var(--text3)", marginTop: 4 }}>UNIDADES</div>
                            </div>

                            {/* Meta progress */}
                            <div style={{ marginBottom: 14 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                                    <span className="mono" style={{ fontSize: 9, letterSpacing: 1, color: "var(--text3)" }}>META: 5.200 un</span>
                                    <span className="mono" style={{ fontSize: 10, color: m.boas / 5200 >= 1 ? "var(--green)" : "var(--text2)" }}>{Math.round(m.boas / 5200 * 100)}%</span>
                                </div>
                                <div className="prog-track" style={{ height: 8 }}>
                                    <div className="prog-fill" style={{ width: `${Math.min(m.boas / 5200 * 100, 100)}%`, background: m.boas / 5200 >= .9 ? "var(--green)" : "var(--orange)" }} />
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                {[["REPROVADOS", m.ruins, "var(--red)"], ["VELOCIDADE", `${m.vel}/m`, "var(--cyan)"]].map(([l, v, c]) => (
                                    <div key={l} style={{ background: "var(--bg2)", border: "1px solid var(--border)", padding: "8px 10px" }}>
                                        <div className="mono" style={{ fontSize: 9, letterSpacing: 1, color: "var(--text3)", marginBottom: 4 }}>{l}</div>
                                        <div className="rajd" style={{ fontSize: 20, fontWeight: 700, color: c }}>{v}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Production table */}
            <div className="sf-card">
                <div className="sf-card-header"><span className="sf-card-title">Resumo por Linha</span></div>
                <Table
                    columns={[
                        { key: "serial", label: "Serial", render: v => <span className="serial">{v}</span> },
                        { key: "linha", label: "Linha" },
                        { key: "turno", label: "Operador" },
                        { key: "boas", label: "Boas", render: v => <span style={{ color: "var(--green)" }}>{v.toLocaleString()}</span> },
                        { key: "ruins", label: "Reprovadas", render: v => <span style={{ color: v > 0 ? "var(--red)" : "var(--text3)" }}>{v}</span> },
                        { key: "vel", label: "Velocidade", render: v => `${v} pct/min` },
                        {
                            key: "oee", label: "OEE", render: v => (
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <div style={{ width: 60, height: 4, background: "var(--border2)", overflow: "hidden" }}>
                                        <div style={{ width: `${v}%`, height: "100%", background: v >= 80 ? "var(--green)" : v >= 60 ? "var(--orange)" : "var(--red)" }} />
                                    </div>
                                    <span className="mono" style={{ fontSize: 11 }}>{v}%</span>
                                </div>
                            )
                        },
                    ]}
                    data={MACHINES}
                />
            </div>
        </div>
    );
}

// ── ALARMES PAGE ──────────────────────────────
function AlarmesPage() {
    const [filter, setFilter] = useState("todos");

    const filtered = ALARMS.filter(a =>
        filter === "todos" ? true :
            filter === "ativos" ? a.ativo :
                a.sev === filter
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <div className="rajd" style={{ fontSize: 28, fontWeight: 700, letterSpacing: 3, color: "#fff", textTransform: "uppercase" }}>Alarmes</div>
                    <div className="mono" style={{ fontSize: 10, color: "var(--text3)", letterSpacing: 2, marginTop: 4 }}>MONITORAMENTO DE FALHAS E EVENTOS</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    {["todos", "ativos", "critical", "warn", "info"].map(f => (
                        <button key={f} className={`btn ${filter === f ? "btn-primary" : "btn-ghost"}`} style={{ padding: "6px 14px", fontSize: 11 }} onClick={() => setFilter(f)}>
                            {f.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Alarm counters */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
                {[
                    { label: "Total", value: ALARMS.length, color: "var(--text)" },
                    { label: "Críticos", value: ALARMS.filter(a => a.sev === "critical").length, color: "var(--red)" },
                    { label: "Avisos", value: ALARMS.filter(a => a.sev === "warn").length, color: "var(--orange)" },
                    { label: "Ativos Agora", value: ALARMS.filter(a => a.ativo).length, color: "var(--cyan)" },
                ].map(item => (
                    <div key={item.label} className="sf-card" style={{ padding: 18, textAlign: "center" }}>
                        <div className="mono" style={{ fontSize: 9, letterSpacing: 3, color: "var(--text3)", marginBottom: 8 }}>{item.label.toUpperCase()}</div>
                        <div className="rajd" style={{ fontSize: 44, fontWeight: 700, color: item.color }}>{item.value}</div>
                    </div>
                ))}
            </div>

            {/* Alarms list */}
            <div className="sf-card">
                <div className="sf-card-header"><span className="sf-card-title">Histórico de Alarmes</span><span className="mono" style={{ fontSize: 9, color: "var(--text3)" }}>{filtered.length} REGISTROS</span></div>
                <div>
                    {filtered.map(a => (
                        <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 20px", borderBottom: "1px solid var(--border)", transition: "background .15s", cursor: "pointer" }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(0,229,255,0.03)"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                            {/* Severity bar */}
                            <div style={{ width: 4, height: 44, background: a.sev === "critical" ? "var(--red)" : a.sev === "warn" ? "var(--orange)" : "var(--cyan)", boxShadow: a.sev === "critical" ? "0 0 8px var(--red)" : a.sev === "warn" ? "0 0 8px var(--orange)" : "none", flexShrink: 0 }} />

                            {/* Severity icon */}
                            <div style={{ width: 36, height: 36, border: `1px solid ${a.sev === "critical" ? "var(--red)" : a.sev === "warn" ? "var(--orange)" : "var(--cyan)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <span style={{ fontSize: 14, color: a.sev === "critical" ? "var(--red)" : a.sev === "warn" ? "var(--orange)" : "var(--cyan)" }}>
                                    {a.sev === "critical" ? "⊗" : a.sev === "warn" ? "△" : "ℹ"}
                                </span>
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 3 }}>{a.nome}</div>
                                <div className="mono" style={{ fontSize: 10, color: "var(--text3)" }}>{a.maquina} · {a.linha}</div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                                <span className={`chip ${a.ativo ? "chip-green" : "chip-gray"}`}>{a.ativo ? "ATIVO" : "FECHADO"}</span>
                                <span className="mono" style={{ fontSize: 10, color: "var(--text3)" }}>{a.hora}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── MANUTENCAO PAGE ────────────────────────────
function ManutencaoPage() {
    const [showForm, setShowForm] = useState(false);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <div className="rajd" style={{ fontSize: 28, fontWeight: 700, letterSpacing: 3, color: "#fff", textTransform: "uppercase" }}>Manutenção</div>
                    <div className="mono" style={{ fontSize: 10, color: "var(--text3)", letterSpacing: 2, marginTop: 4 }}>ORDENS DE SERVIÇO · CORRETIVA E PREVENTIVA</div>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ ABRIR OS</button>
            </div>

            {showForm && (
                <div className="animate-up">
                    <Form
                        title="Abrir Ordem de Serviço"
                        fields={[
                            { name: "serial", label: "Máquina", type: "select", options: MACHINES.map(m => ({ value: m.serial, label: m.serial })) },
                            { name: "tipo", label: "Tipo", type: "select", options: [{ value: "corretiva", label: "Corretiva" }, { value: "preventiva", label: "Preventiva" }] },
                            { name: "tecnico", label: "Técnico", placeholder: "Nome do técnico" },
                            { name: "descricao", label: "Descrição", placeholder: "Descreva o problema ou serviço", full: true },
                        ]}
                        onSubmit={(v) => { alert(`OS aberta para ${v.serial}`); setShowForm(false); }}
                        onCancel={() => setShowForm(false)}
                    />
                </div>
            )}

            {/* KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
                {[
                    { label: "OS Abertas", value: 1, color: "var(--red)" },
                    { label: "OS Concluídas Hoje", value: 2, color: "var(--green)" },
                    { label: "MTTR Médio", value: "1h 12m", color: "var(--orange)" },
                    { label: "Disponibilidade", value: "66%", color: "var(--cyan)" },
                ].map(k => (
                    <div key={k.label} className="sf-card" style={{ padding: 18 }}>
                        <div className="mono" style={{ fontSize: 9, letterSpacing: 3, color: "var(--text3)", marginBottom: 10 }}>{k.label.toUpperCase()}</div>
                        <div className="rajd" style={{ fontSize: 36, fontWeight: 700, color: k.color }}>{k.value}</div>
                    </div>
                ))}
            </div>

            {/* OS Table */}
            <div className="sf-card">
                <div className="sf-card-header"><span className="sf-card-title">Ordens de Serviço</span></div>
                <Table
                    columns={[
                        { key: "id", label: "OS #", render: v => <span className="mono" style={{ color: "var(--cyan)" }}>OS-{String(v).padStart(4, "0")}</span> },
                        { key: "serial", label: "Máquina", render: v => <span className="serial">{v}</span> },
                        { key: "tipo", label: "Tipo", render: v => <span className={`chip ${v === "Corretiva" ? "chip-red" : "chip-orange"}`}>{v}</span> },
                        { key: "descricao", label: "Descrição" },
                        { key: "tecnico", label: "Técnico" },
                        { key: "inicio", label: "Início" },
                        { key: "fim", label: "Fim" },
                        { key: "status", label: "Status", render: v => <span className={`chip ${v === "aberta" ? "chip-red" : "chip-green"}`}>{v === "aberta" ? "ABERTA" : "CONCLUÍDA"}</span> },
                    ]}
                    data={MANUTENCAO}
                />
            </div>

            {/* Machine status for maintenance */}
            <div className="sf-card">
                <div className="sf-card-header"><span className="sf-card-title">Status de Manutenção por Máquina</span></div>
                <div className="sf-card-body">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                        {MACHINES.map(m => (
                            <div key={m.id} style={{ background: "var(--bg2)", border: `1px solid ${m.status === "offline" ? "var(--red)" : "var(--border)"}`, padding: 16 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                                    <span className="serial">{m.serial}</span>
                                    <span className={`chip chip-${m.status === "online" ? "green" : "red"}`}>{m.status === "online" ? "OK" : "PARADA"}</span>
                                </div>
                                <div className="mono" style={{ fontSize: 9, letterSpacing: 1, color: "var(--text3)", marginBottom: 6 }}>PRÓXIMA PREVENTIVA</div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{m.status === "online" ? "25 horas" : "AGUARDANDO OS"}</div>
                                {m.status === "offline" && (
                                    <div style={{ marginTop: 10, padding: "6px 10px", background: "rgba(255,61,61,0.08)", border: "1px solid rgba(255,61,61,0.3)", fontSize: 11, color: "var(--red)" }}>
                                        OS-0001 em andamento
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── EMPRESAS / ADMIN PAGE ─────────────────────
function EmpresasPage() {
    const [showForm, setShowForm] = useState(false);
    const empresas = [{ id: 1, nome: "NH Alimentos", cnpj: "12.345.678/0001-90", maquinas: 3, usuarios: 5 }];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <div className="rajd" style={{ fontSize: 28, fontWeight: 700, letterSpacing: 3, color: "#fff", textTransform: "uppercase" }}>Empresas</div>
                    <div className="mono" style={{ fontSize: 10, color: "var(--text3)", letterSpacing: 2, marginTop: 4 }}>GESTÃO MULTIEMPRESA</div>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ NOVA EMPRESA</button>
            </div>

            {showForm && (
                <div className="animate-up">
                    <Form
                        title="Cadastrar Empresa"
                        fields={[
                            { name: "nome", label: "Razão Social", placeholder: "Nome da empresa" },
                            { name: "cnpj", label: "CNPJ", placeholder: "00.000.000/0001-00" },
                        ]}
                        onSubmit={(v) => { alert(`Empresa ${v.nome} cadastrada!`); setShowForm(false); }}
                        onCancel={() => setShowForm(false)}
                    />
                </div>
            )}

            <div className="sf-card">
                <div className="sf-card-header"><span className="sf-card-title">Empresas Cadastradas</span></div>
                <Table
                    columns={[
                        { key: "id", label: "ID", render: v => <span className="mono" style={{ color: "var(--text3)" }}>#{v}</span> },
                        { key: "nome", label: "Razão Social" },
                        { key: "cnpj", label: "CNPJ", render: v => <span className="mono" style={{ fontSize: 11 }}>{v}</span> },
                        { key: "maquinas", label: "Máquinas", render: v => <span className="rajd" style={{ fontSize: 18, color: "var(--cyan)" }}>{v}</span> },
                        { key: "usuarios", label: "Usuários", render: v => <span className="rajd" style={{ fontSize: 18, color: "var(--green)" }}>{v}</span> },
                    ]}
                    data={empresas}
                />
            </div>
        </div>
    );
}

// ── METAS PAGE ────────────────────────────────
function MetasPage() {
    const [selected, setSelected] = useState(MACHINES[0].serial);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
                <div className="rajd" style={{ fontSize: 28, fontWeight: 700, letterSpacing: 3, color: "#fff", textTransform: "uppercase" }}>Metas OEE</div>
                <div className="mono" style={{ fontSize: 10, color: "var(--text3)", letterSpacing: 2, marginTop: 4 }}>CONFIGURAÇÃO DE TARGETS POR MÁQUINA</div>
            </div>

            <div style={{ display: "flex", gap: 14 }}>
                <div style={{ flex: 1 }}>
                    <Form
                        title={`Metas — ${selected}`}
                        fields={[
                            { name: "serial", label: "Máquina", type: "select", options: MACHINES.map(m => ({ value: m.serial, label: m.serial })), default: selected },
                            { name: "meta_producao", label: "Meta Produção/Hora", placeholder: "650", default: "650" },
                            { name: "meta_disp", label: "Meta Disponibilidade %", placeholder: "85", default: "85" },
                            { name: "meta_perf", label: "Meta Performance %", placeholder: "85", default: "85" },
                            { name: "meta_qual", label: "Meta Qualidade %", placeholder: "98", default: "98" },
                        ]}
                        onSubmit={(v) => alert(`Metas salvas para ${v.serial}!`)}
                    />
                </div>

                <div style={{ width: 280 }}>
                    <div className="sf-card" style={{ height: "100%" }}>
                        <div className="sf-card-header"><span className="sf-card-title">Referência Mundial</span></div>
                        <div className="sf-card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {[["OEE World Class", "85%", "var(--cyan)"], ["Disponibilidade", "90%", "var(--green)"], ["Performance", "95%", "var(--green)"], ["Qualidade", "99.9%", "var(--yellow)"]].map(([l, v, c]) => (
                                <div key={l}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                                        <span style={{ fontSize: 12, color: "var(--text2)" }}>{l}</span>
                                        <span className="mono" style={{ fontSize: 11, color: c }}>{v}</span>
                                    </div>
                                    <div className="prog-track">
                                        <div className="prog-fill" style={{ width: v, background: c }} />
                                    </div>
                                </div>
                            ))}
                            <div style={{ marginTop: 8, padding: 12, background: "var(--bg3)", border: "1px solid var(--border)" }}>
                                <div className="mono" style={{ fontSize: 9, letterSpacing: 2, color: "var(--text3)", marginBottom: 6 }}>FÓRMULA OEE</div>
                                <div className="mono" style={{ fontSize: 11, color: "var(--cyan)", lineHeight: 1.8 }}>
                                    OEE = D × P × Q<br />
                                    <span style={{ color: "var(--text3)" }}>Ex: 85% × 95% × 99.9%</span><br />
                                    <span style={{ color: "var(--green)" }}>= 80.9%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
//  APP ROOT
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
    const [page, setPage] = useState("login");
    const [user, setUser] = useState(null);

    const handleLogin = (u) => { setUser(u); setPage("dashboard"); };

    const PAGES = {
        dashboard: <DashboardPage />,
        oee: <OEEPage />,
        maquinas: <MaquinasPage />,
        producao: <ProducaoPage />,
        alarmes: <AlarmesPage />,
        manutencao: <ManutencaoPage />,
        empresas: <EmpresasPage />,
        usuarios: <div style={{ padding: 20 }}><div className="rajd" style={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>Usuários</div><p style={{ marginTop: 12, color: "var(--text2)" }}>Módulo em desenvolvimento.</p></div>,
        metas: <MetasPage />,
    };

    return (
        <>
            <style>{css}</style>
            <div className="scanlines" style={{ width: "100vw", height: "100vh" }}>
                <div className="gridbg" />

                {page === "login"
                    ? <LoginPage onLogin={handleLogin} />
                    : (
                        <div className="app" style={{ display: "flex", height: "100vh", position: "relative", zIndex: 1 }}>
                            <Sidebar page={page} setPage={setPage} />
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                                <Navbar page={page} user={user} setPage={setPage} />
                                {/* Ticker */}
                                <div style={{ background: "var(--bg2)", borderBottom: "1px solid var(--border)", padding: "5px 0", overflow: "hidden", whiteSpace: "nowrap" }}>
                                    <div className="mono" style={{ display: "inline-block", fontSize: 10, letterSpacing: 2, color: "var(--text3)", animation: "march 20s linear infinite", backgroundSize: "40px 100%" }}>
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                        <span style={{ color: "var(--green)" }}>EVA1000-00021 ● ONLINE ● OEE: 75.3%</span>
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                        CONTADOR_BOAS: 4.821 un
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                        <span style={{ color: "var(--orange)" }}>EVA1000-00022 ● PARADA ● OS ABERTA</span>
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                        VELOCIDADE: 42 pct/min
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                        <span style={{ color: "var(--green)" }}>EVA1000-00023 ● ONLINE ● OEE: 81.2%</span>
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                        SERVIDOR OK · INFLUXDB OK · MQTT BROKER OK
                                    </div>
                                </div>
                                <main style={{ flex: 1, overflowY: "auto", padding: 24, position: "relative" }} key={page}>
                                    <div className="animate-up">
                                        {PAGES[page] || <div style={{ color: "var(--text2)" }}>Página não encontrada</div>}
                                    </div>
                                </main>
                            </div>
                        </div>
                    )
                }
            </div>
        </>
    );
}
