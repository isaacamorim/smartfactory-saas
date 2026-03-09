// src/components/Navbar.jsx
import { MACHINES } from "../data/mockData";

const PAGE_LABELS = {
  dashboard: "Dashboard", oee: "OEE", maquinas: "Máquinas",
  producao: "Produção", alarmes: "Alarmes", manutencao: "Manutenção",
  empresas: "Empresas", usuarios: "Usuários", metas: "Metas OEE",
};

const SERVICES = [
  { label: "MQTT",   color: "var(--green)" },
  { label: "INFLUX", color: "var(--green)" },
  { label: "API",    color: "var(--green)" },
];

export default function Navbar({ page, user, onLogout }) {
  const now = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <header style={{
      height: 52, background: "#fff",
      borderBottom: "1px solid var(--border)",
      boxShadow: "0 1px 4px rgba(0,0,0,.06)",
      display: "flex", alignItems: "center",
      padding: "0 24px", gap: 14, zIndex: 10,
    }}>
      {/* Breadcrumb */}
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 10,
        letterSpacing: 2, color: "var(--text3)", flex: 1,
      }}>
        SMARTFACTORY /&nbsp;
        <span style={{ color: "var(--primary)", fontWeight: 700 }}>
          {PAGE_LABELS[page]?.toUpperCase() ?? page.toUpperCase()}
        </span>
      </div>

      {/* Live ticker strip */}
      <div style={{
        overflow: "hidden", width: 340,
        borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)",
        padding: "0 12px",
      }}>
        <div style={{
          display: "inline-block", whiteSpace: "nowrap",
          fontFamily: "var(--font-mono)", fontSize: 9,
          letterSpacing: 1, color: "var(--text3)",
          animation: "ticker-scroll 22s linear infinite",
        }}>
          {MACHINES.map(m => (
            <span key={m.serial} style={{ marginRight: 32 }}>
              <span style={{ color: m.status === "online" ? "var(--green)" : "var(--red)" }}>
                {m.serial} ● {m.status === "online" ? "ONLINE" : "PARADA"}
              </span>
              {m.status === "online" && <span style={{ color: "var(--text3)" }}> ● OEE: {m.oee}%</span>}
            </span>
          ))}
        </div>
      </div>

      {/* Service status dots */}
      <div style={{ display: "flex", gap: 12 }}>
        {SERVICES.map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, display: "inline-block", animation: "blink 2s infinite" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 1, color: s.color }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Clock */}
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 10,
        color: "var(--text2)", borderLeft: "1px solid var(--border)", paddingLeft: 14,
      }}>{now}</div>

      {/* User + logout */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", borderLeft: "1px solid var(--border)", paddingLeft: 14 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text2)" }}>
          {user?.nome ?? "ADMIN"}
        </div>
        <div className="hex" style={{
          width: 30, height: 30,
          background: "var(--primary)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, color: "#fff", cursor: "pointer",
        }}>
          {(user?.nome ?? "AD").slice(0, 2).toUpperCase()}
        </div>
        <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 10 }} onClick={onLogout}>
          SAIR
        </button>
      </div>
    </header>
  );
}
