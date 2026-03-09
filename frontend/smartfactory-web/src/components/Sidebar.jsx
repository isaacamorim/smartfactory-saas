// src/components/Sidebar.jsx
import { NAV_ITEMS } from "../data/mockData";

export default function Sidebar({ page, setPage }) {
  return (
    <aside style={{
      width: 224, minWidth: 224,
      background: "#fff",
      borderRight: "1px solid var(--border)",
      boxShadow: "2px 0 8px rgba(0,0,0,.05)",
      display: "flex", flexDirection: "column",
      position: "relative", overflow: "hidden", zIndex: 10,
    }}>
      {/* Top accent */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: "linear-gradient(90deg, var(--primary-dark), var(--primary), var(--primary-light))",
      }} />

      {/* Logo */}
      <div style={{ padding: "22px 18px 18px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div className="hex" style={{
            width: 34, height: 34, background: "var(--primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 900, color: "#fff",
            fontFamily: "var(--font-display)",
          }}>SF</div>
          <span style={{
            fontFamily: "var(--font-display)", fontSize: 17,
            fontWeight: 700, letterSpacing: 2, color: "var(--text)",
          }}>SMART FACTORY</span>
        </div>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 9,
          letterSpacing: 3, color: "var(--primary)", paddingLeft: 44,
        }}>IIoT PLATFORM</div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "10px 0", overflowY: "auto" }}>
        {NAV_ITEMS.map((item, i) =>
          item.section ? (
            <div key={i} style={{
              padding: "14px 18px 4px",
              fontFamily: "var(--font-mono)", fontSize: 9,
              letterSpacing: 3, color: "var(--text3)",
            }}>{item.section}</div>
          ) : (
            <div
              key={item.id}
              onClick={() => setPage(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 18px", cursor: "pointer",
                background: page === item.id ? "var(--primary-soft)" : "transparent",
                borderLeft: page === item.id ? "3px solid var(--primary)" : "3px solid transparent",
                color: page === item.id ? "var(--primary)" : "var(--text2)",
                fontSize: 14, fontWeight: 600, letterSpacing: 1,
                transition: "all .15s",
              }}
            >
              <span style={{ width: 18, textAlign: "center", fontSize: 13, opacity: page === item.id ? 1 : 0.5 }}>
                {item.icon}
              </span>
              {item.label}
              {item.badge && (
                <span style={{
                  marginLeft: "auto",
                  border: `1px solid ${item.badgeColor}`,
                  color: item.badgeColor,
                  fontSize: 9, padding: "2px 7px",
                  fontFamily: "var(--font-mono)",
                  background: `${item.badgeColor}18`,
                }}>{item.badge}</span>
              )}
            </div>
          )
        )}
      </nav>

      {/* Footer */}
      <div style={{ padding: "14px 18px", borderTop: "1px solid var(--border)", background: "var(--bg1)" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text3)", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%", background: "var(--green)",
            display: "inline-block", animation: "blink 2s infinite",
          }} />
          SISTEMA ONLINE
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text3)" }}>
          191.252.217.250
        </div>
      </div>
    </aside>
  );
}
