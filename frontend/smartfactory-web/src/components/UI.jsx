// src/components/UI.jsx

// ─── STAT CARD ────────────────────────────────
export function StatCard({ label, value, unit, delta, deltaPos = true, accent = "var(--primary)" }) {
  return (
    <div className="sf-card" style={{ padding: 20 }}>
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3, background:accent, borderRadius:"0 0 8px 8px" }} />
      <div style={{ fontFamily:"var(--font-body)", fontSize:11, fontWeight:600, letterSpacing:.5, color:"var(--text3)", marginBottom:10, textTransform:"uppercase" }}>
        {label}
      </div>
      <div style={{ fontFamily:"var(--font-display)", fontSize:36, fontWeight:800, color:"var(--text)", lineHeight:1 }}>
        {value}
        {unit && <span style={{ fontSize:13, color:"var(--text3)", fontWeight:500, marginLeft:4 }}>{unit}</span>}
      </div>
      {delta && (
        <div style={{ fontFamily:"var(--font-mono)", fontSize:10, color:deltaPos?"var(--green)":"var(--red)", marginTop:8 }}>{delta}</div>
      )}
    </div>
  );
}

// ─── OEE GAUGE ───────────────────────────────
export function OEEGauge({ value = 0, size = 160, color = "var(--primary)", label = "OEE %" }) {
  const r = (size/2) - 10;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - value/100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#eee" strokeWidth="9" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="9"
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        style={{ filter:`drop-shadow(0 2px 4px ${color}44)`,
          transform:`rotate(-90deg)`, transformOrigin:`${size/2}px ${size/2}px`,
          transition:"stroke-dashoffset 1.2s ease" }} />
      <text x={size/2} y={size/2-4} textAnchor="middle" fontFamily="Plus Jakarta Sans" fontSize={size*.21} fontWeight="800" fill="#212529">{value}</text>
      <text x={size/2} y={size/2+15} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill="#adb5bd" letterSpacing="2">{label}</text>
    </svg>
  );
}

// ─── PROGRESS BAR ─────────────────────────────
export function ProgressBar({ label, value, meta, color = "var(--primary)" }) {
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
        <span style={{ fontSize:13, fontWeight:500, color:"var(--text)" }}>{label}</span>
        <span style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--text2)" }}>
          {value}% {meta && `/ meta: ${meta}%`}
        </span>
      </div>
      <div className="prog-track">
        <div className="prog-fill" style={{ width:`${Math.min(value,100)}%`, background:color }} />
      </div>
    </div>
  );
}

// ─── MINI OEE BAR ─────────────────────────────
export function OEEMiniBar({ value }) {
  const color = value>=80?"var(--green)":value>=60?"var(--orange)":"var(--red)";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ flex:1, height:5, background:"var(--bg3)", overflow:"hidden", borderRadius:99 }}>
        <div style={{ width:`${value}%`, height:"100%", background:color, transition:"width 1s", borderRadius:99 }} />
      </div>
      <span style={{ fontFamily:"var(--font-mono)", fontSize:11, minWidth:40, textAlign:"right", color:"var(--text2)", fontWeight:500 }}>
        {value}%
      </span>
    </div>
  );
}

// ─── PAGE HEADER ──────────────────────────────
export function PageHeader({ title, sub, action }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
      <div>
        <div className="page-title">{title}</div>
        {sub && <div className="page-sub">{sub}</div>}
      </div>
      {action && <div style={{ display:"flex", gap:8 }}>{action}</div>}
    </div>
  );
}

// ─── ALARM SEV BAR ────────────────────────────
export function SevBar({ sev }) {
  const c = { critical:"var(--red)", warn:"var(--orange)", info:"var(--info)" }[sev] ?? "var(--text3)";
  return <div style={{ width:3, minHeight:40, background:c, borderRadius:99, flexShrink:0 }} />;
}

// ─── FEEDBACK BANNER ──────────────────────────
export function Feedback({ msg, tipo, onClose }) {
  if (!msg) return null;
  const ok = tipo === "ok";
  return (
    <div style={{
      padding:"11px 16px", borderRadius:6,
      background: ok ? "#f0fdf4" : "#fef2f2",
      border:`1px solid ${ok ? "#86efac" : "#fca5a5"}`,
      color: ok ? "var(--green)" : "var(--red)",
      fontSize:13, fontWeight:500,
      display:"flex", justifyContent:"space-between", alignItems:"center",
    }}>
      <span>{ok ? "✓" : "✕"}  {msg}</span>
      {onClose && <span style={{ cursor:"pointer", opacity:.6, marginLeft:12 }} onClick={onClose}>✕</span>}
    </div>
  );
}

// ─── EMPTY STATE ──────────────────────────────
export function EmptyState({ msg = "Nenhum registro encontrado.", action }) {
  return (
    <div style={{ padding:"48px 24px", textAlign:"center", color:"var(--text3)" }}>
      <div style={{ fontSize:32, marginBottom:12, opacity:.3 }}>⬡</div>
      <div style={{ fontFamily:"var(--font-body)", fontSize:13, marginBottom: action?16:0 }}>{msg}</div>
      {action}
    </div>
  );
}

// ─── MODAL ────────────────────────────────────
export function Modal({ title, onClose, children, width = 520 }) {
  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,.35)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center",
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        width, background:"#fff", borderRadius:10,
        boxShadow:"0 20px 60px rgba(0,0,0,.2)", overflow:"hidden",
        animation:"slideUp .2s ease both",
      }}>
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"16px 20px", borderBottom:"1px solid var(--border)",
        }}>
          <span style={{ fontFamily:"var(--font-display)", fontSize:15, fontWeight:700 }}>{title}</span>
          <button className="btn btn-icon" onClick={onClose} style={{ fontSize:16 }}>✕</button>
        </div>
        <div style={{ padding:20 }}>{children}</div>
      </div>
    </div>
  );
}
