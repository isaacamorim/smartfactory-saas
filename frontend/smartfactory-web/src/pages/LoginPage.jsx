// src/pages/LoginPage.jsx
import { useState } from "react";

export default function LoginPage({ onLogin }) {
  const [email,   setEmail]   = useState("admin@smartfactory.com");
  const [senha,   setSenha]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    // Swap for: await authAPI.login(email, senha) in production
    setTimeout(() => {
      setLoading(false);
      onLogin({ nome: email.split("@")[0].toUpperCase(), email });
    }, 1200);
  };

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", background: "var(--bg0)", position: "relative", overflow: "hidden" }}>
      <div className="grid-bg" />

      {/* ── LEFT: OEE visualization panel ── */}
      <div style={{
        width: "44%", background: "var(--bg1)", borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        padding: 60, position: "relative", overflow: "hidden",
      }}>
        {/* Corner brackets */}
        {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h]) => (
          <div key={`${v}${h}`} style={{
            position: "absolute", [v]: 24, [h]: 24, width: 32, height: 32,
            borderTop:    v === "top"    ? "2px solid var(--cyan)" : "none",
            borderBottom: v === "bottom" ? "2px solid var(--cyan)" : "none",
            borderLeft:   h === "left"   ? "2px solid var(--cyan)" : "none",
            borderRight:  h === "right"  ? "2px solid var(--cyan)" : "none",
            opacity: 0.4,
          }} />
        ))}

        {/* Triple ring OEE gauge */}
        <svg width="250" height="250" viewBox="0 0 250 250" style={{ marginBottom: 32 }}>
          {/* Outer — Disponibilidade */}
          <circle cx="125" cy="125" r="112" fill="none" stroke="var(--border2)" strokeWidth="8" />
          <circle cx="125" cy="125" r="112" fill="none" stroke="var(--cyan)" strokeWidth="8"
            strokeDasharray="703" strokeDashoffset="84"
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 8px var(--cyan))", transform: "rotate(-90deg)", transformOrigin: "125px 125px" }} />
          {/* Middle — Performance */}
          <circle cx="125" cy="125" r="89" fill="none" stroke="var(--border2)" strokeWidth="7" />
          <circle cx="125" cy="125" r="89" fill="none" stroke="var(--green)" strokeWidth="7"
            strokeDasharray="559" strokeDashoffset="48"
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 6px var(--green))", transform: "rotate(-90deg)", transformOrigin: "125px 125px" }} />
          {/* Inner — Qualidade */}
          <circle cx="125" cy="125" r="68" fill="none" stroke="var(--border2)" strokeWidth="6" />
          <circle cx="125" cy="125" r="68" fill="none" stroke="var(--yellow)" strokeWidth="6"
            strokeDasharray="427" strokeDashoffset="8"
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 5px var(--yellow))", transform: "rotate(-90deg)", transformOrigin: "125px 125px" }} />
          {/* Center */}
          <text x="125" y="117" textAnchor="middle" fontFamily="Rajdhani" fontSize="46" fontWeight="700" fill="#fff">75.3</text>
          <text x="125" y="137" textAnchor="middle" fontFamily="Share Tech Mono" fontSize="10" fill="var(--text3)" letterSpacing="3">OEE %</text>
          <text x="125" y="158" textAnchor="middle" fontFamily="Share Tech Mono" fontSize="8" fill="var(--cyan2)" letterSpacing="2">DISP · PERF · QUAL</text>
        </svg>

        <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, letterSpacing: 4, color: "#fff", textAlign: "center", marginBottom: 8 }}>
          SMART FACTORY
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 4, color: "var(--cyan)", textAlign: "center", marginBottom: 36 }}>
          INDUSTRIAL MONITORING PLATFORM
        </div>

        <div style={{ display: "flex", gap: 40 }}>
          {[["3","MÁQUINAS"],["75.3%","OEE MÉDIO"],["4.821","PRODUÇÃO"]].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "#fff" }}>{v}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 2, color: "var(--text3)" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT: login form ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 60 }}>
        <div style={{ width: 360 }} className="animate-up">
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, letterSpacing: 3, color: "#fff", marginBottom: 6 }}>
              ACESSAR PLATAFORMA
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 2, color: "var(--text3)" }}>
              SMART FACTORY — v1.0.0
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 2, color: "var(--text3)", marginBottom: 6 }}>EMAIL</div>
            <input className="sf-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" />
          </div>

          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 2, color: "var(--text3)", marginBottom: 6 }}>SENHA</div>
            <input className="sf-input" type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" />
          </div>

          <button className="btn btn-solid" style={{ width: "100%", padding: 13, fontSize: 15 }} onClick={handleLogin}>
            {loading ? "AUTENTICANDO..." : "ENTRAR"}
          </button>

          {loading && (
            <div style={{ marginTop: 14 }}>
              <div style={{ height: 2, background: "var(--border2)", overflow: "hidden" }}>
                <div style={{ height: "100%", background: "linear-gradient(90deg,var(--cyan),var(--green))", animation: "loadFill 1.2s ease forwards" }} />
              </div>
            </div>
          )}

          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 1, color: "var(--text3)", textAlign: "center", marginTop: 28 }}>
            Plataforma Industrial IIoT · NH Alimentos
          </div>
        </div>
      </div>
    </div>
  );
}
