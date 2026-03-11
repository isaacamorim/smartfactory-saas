// src/components/Navbar.jsx
import { MACHINES } from "../data/mockData";

const PAGE_LABELS = {
    dashboard:"Dashboard", oee:"OEE", maquinas:"Máquinas", linhas:"Linhas",
    producao:"Produção", alarmes:"Alarmes", manutencao:"Manutenção",
    empresas:"Empresas", usuarios:"Usuários", metas:"Metas OEE",
};

const ROLE_LABELS = { admin:"Administrador", gerente:"Gerente", operador:"Operador" };
const ROLE_COLORS = { admin:"var(--primary)", gerente:"var(--info)", operador:"var(--green)" };

export default function Navbar({ page, usuario, onLogout }) {
    const now = new Date().toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" });
    const role = usuario?.role ?? "operador";

    return (
        <header style={{
            height:50, background:"#fff", borderBottom:"1px solid var(--border)",
            display:"flex", alignItems:"center", padding:"0 20px", gap:12, zIndex:10,
        }}>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--text3)", flex:1 }}>
                SmartFactory /&nbsp;
                <span style={{ color:"var(--primary)", fontWeight:600 }}>{PAGE_LABELS[page] ?? page}</span>
            </div>

            {/* Ticker */}
            <div style={{ overflow:"hidden", width:300, borderLeft:"1px solid var(--border)",
                borderRight:"1px solid var(--border)", padding:"0 12px" }}>
                <div style={{ display:"inline-block", whiteSpace:"nowrap",
                    fontFamily:"var(--font-mono)", fontSize:10, color:"var(--text3)",
                    animation:"ticker-scroll 24s linear infinite" }}>
                    {MACHINES.map(m => (
                        <span key={m.serial} style={{ marginRight:28 }}>
                            <span style={{ color:m.status==="online"?"var(--green)":"var(--red)" }}>
                                {m.serial} ● {m.status==="online"?"ONLINE":"PARADA"}
                            </span>
                            {m.status==="online" && <span> ● OEE {m.oee}%</span>}
                        </span>
                    ))}
                </div>
            </div>

            {/* Services */}
            {["MQTT","INFLUX","API"].map(s => (
                <div key={s} style={{ display:"flex", alignItems:"center", gap:4 }}>
                    <span style={{ width:5, height:5, borderRadius:"50%", background:"var(--green)",
                        display:"inline-block", animation:"blink 2s infinite" }} />
                    <span style={{ fontFamily:"var(--font-mono)", fontSize:9, color:"var(--green)", fontWeight:600 }}>{s}</span>
                </div>
            ))}

            <div style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--text2)",
                borderLeft:"1px solid var(--border)", paddingLeft:12 }}>{now}</div>

            {/* User badge */}
            <div style={{ display:"flex", gap:8, alignItems:"center", borderLeft:"1px solid var(--border)", paddingLeft:12 }}>
                <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:12, fontWeight:600, color:"var(--text)" }}>{usuario?.nome ?? "—"}</div>
                    <div style={{ fontFamily:"var(--font-mono)", fontSize:9, color: ROLE_COLORS[role] }}>
                        {ROLE_LABELS[role]}
                        {usuario?.empresa_id && <span style={{ color:"var(--text3)" }}> · emp #{usuario.empresa_id}</span>}
                    </div>
                </div>
                <div style={{
                    width:30, height:30, borderRadius:6, background:"var(--primary)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:11, fontWeight:700, color:"#fff", fontFamily:"var(--font-display)",
                }}>{(usuario?.nome ?? "AD").slice(0,2).toUpperCase()}</div>
                <button className="btn btn-ghost" style={{ padding:"4px 10px", fontSize:11 }} onClick={onLogout}>Sair</button>
            </div>
        </header>
    );
}
