// src/components/UI.jsx

// ─── STAT CARD ────────────────────────────────
export function StatCard({ label, value, unit, delta, deltaPos = true, accent = "var(--primary)" }) {
  return (
    <div className="sf-card" style={{ padding: 20 }}>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: accent }} />
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 3, color: "var(--text3)", marginBottom: 12, textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 700, color: "var(--text)", lineHeight: 1 }}>
        {value}
        {unit && <span style={{ fontSize: 15, color: "var(--text3)", fontWeight: 400, marginLeft: 4 }}>{unit}</span>}
      </div>
      {delta && (
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: deltaPos ? "var(--green)" : "var(--red)", marginTop: 8 }}>
          {delta}
        </div>
      )}
    </div>
  );
}

// ─── OEE GAUGE ───────────────────────────────
export function OEEGauge({ value = 0, size = 160, color = "var(--primary)", label = "OEE %" }) {
  const r            = (size / 2) - 10;
  const circumference = 2 * Math.PI * r;
  const offset       = circumference * (1 - value / 100);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e8e8e8" strokeWidth="10" />
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          filter: `drop-shadow(0 2px 6px ${color}55)`,
          transform: `rotate(-90deg)`,
          transformOrigin: `${size/2}px ${size/2}px`,
          transition: "stroke-dashoffset 1.2s ease",
        }}
      />
      <text x={size/2} y={size/2 - 6} textAnchor="middle" fontFamily="Rajdhani" fontSize={size*0.22} fontWeight="700" fill="#333">
        {value}
      </text>
      <text x={size/2} y={size/2 + 14} textAnchor="middle" fontFamily="Share Tech Mono" fontSize="9" fill="#999" letterSpacing="3">
        {label}
      </text>
    </svg>
  );
}

// ─── PROGRESS BAR ─────────────────────────────
export function ProgressBar({ label, value, meta, color = "var(--primary)" }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{label}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text2)" }}>
          {value}% {meta && `/ ${meta}%`}
        </span>
      </div>
      <div className="prog-track" style={{ height: 6 }}>
        <div className="prog-fill" style={{ width: `${Math.min(value, 100)}%`, background: color }} />
      </div>
    </div>
  );
}

// ─── MINI OEE BAR ─────────────────────────────
export function OEEMiniBar({ value }) {
  const color = value >= 80 ? "var(--green)" : value >= 60 ? "var(--orange)" : "var(--red)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 5, background: "var(--bg3)", overflow: "hidden", borderRadius: 2 }}>
        <div style={{ width: `${value}%`, height: "100%", background: color, transition: "width 1s", borderRadius: 2 }} />
      </div>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, minWidth: 40, textAlign: "right", color: "var(--text2)" }}>
        {value}%
      </span>
    </div>
  );
}

// ─── PAGE HEADER ──────────────────────────────
export function PageHeader({ title, sub, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
      <div>
        <div className="page-title">{title}</div>
        {sub && <div className="page-sub">{sub}</div>}
      </div>
      {action}
    </div>
  );
}

// ─── ALARM SEVERITY BAR ───────────────────────
export function SevBar({ sev }) {
  const colors = { critical: "var(--red)", warn: "var(--orange)", info: "var(--info)" };
  const c = colors[sev] ?? "var(--text3)";
  return (
    <div style={{
      width: 4, height: 38,
      background: c,
      boxShadow: sev === "critical" ? `0 0 6px ${c}` : "none",
      flexShrink: 0, borderRadius: 2,
    }} />
  );
}
