// src/components/Navbar.jsx
import { MACHINES } from "../data/mockData";

const PAGE_LABELS = {
  dashboard:"Dashboard", oee:"OEE", maquinas:"Máquinas", linhas:"Linhas",
  producao:"Produção", alarmes:"Alarmes", manutencao:"Manutenção",
  empresas:"Empresas", usuarios:"Usuários", metas:"Metas OEE",
};

export default function Navbar({ page, user, onLogout }) {
  const now = new Date().toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" });
  return (
    <header style={{
      height: 50, background: "#fff",
      borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center",
      padding: "0 20px", gap: 12, zIndex: 10,
    }}>
      {/* Breadcrumb */}
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text3)", flex: 1 }}>
        SmartFactory /&nbsp;
        <span style={{ color: "var(--primary)", fontWeight: 600 }}>
          {PAGE_LABELS[page] ?? page}
        </span>
      </div>

      {/* Ticker */}
      <div style={{ overflow: "hidden", width: 320, borderLeft: "1px solid var(--border)",
        borderRight: "1px solid var(--border)", padding: "0 12px" }}>
        <div style={{ display: "inline-block", whiteSpace: "nowrap",
          fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text3)",
          animation: "ticker-scroll 24s linear infinite" }}>
          {MACHINES.map(m => (
            <span key={m.serial} style={{ marginRight: 28 }}>
              <span style={{ color: m.status==="online" ? "var(--green)" : "var(--red)" }}>
                {m.serial} ● {m.status==="online" ? "ONLINE" : "PARADA"}
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

      {/* Clock */}
      <div style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--text2)",
        borderLeft:"1px solid var(--border)", paddingLeft:12 }}>{now}</div>

      {/* User */}
      <div style={{ display:"flex", gap:8, alignItems:"center", borderLeft:"1px solid var(--border)", paddingLeft:12 }}>
        <span style={{ fontSize:12, fontWeight:600, color:"var(--text2)" }}>{user?.nome ?? "ADMIN"}</span>
        <div style={{
          width:28, height:28, borderRadius:6, background:"var(--primary)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:11, fontWeight:700, color:"#fff", fontFamily:"var(--font-display)",
        }}>{(user?.nome ?? "AD").slice(0,2).toUpperCase()}</div>
        <button className="btn btn-ghost" style={{ padding:"4px 10px", fontSize:11 }} onClick={onLogout}>Sair</button>
      </div>
    </header>
  );
}
