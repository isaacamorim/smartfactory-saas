// src/components/Sidebar.jsx
import { NAV_ITEMS } from "../data/mockData";

export default function Sidebar({ page, setPage, usuario }) {
    const role = usuario?.role ?? "operador";

    // Páginas visíveis por role
    const visible = {
        admin:    ["dashboard","oee","maquinas","linhas","producao","alarmes","manutencao","empresas","usuarios","metas"],
        gerente:  ["dashboard","oee","maquinas","linhas","producao","alarmes","manutencao","usuarios","metas"],
        operador: ["dashboard","oee","producao","alarmes"],
    }[role] ?? [];

    return (
        <aside style={{
            width:220, minWidth:220, background:"#fff",
            borderRight:"1px solid var(--border)",
            boxShadow:"1px 0 4px rgba(0,0,0,.05)",
            display:"flex", flexDirection:"column",
            position:"relative", zIndex:10,
        }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:3,
                background:"linear-gradient(90deg, var(--primary-dark), var(--primary))" }} />

            {/* Logo */}
            <div style={{ padding:"20px 16px 16px", borderBottom:"1px solid var(--border)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                    <div style={{
                        width:32, height:32, background:"var(--primary)", borderRadius:7,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:13, fontWeight:800, color:"#fff", fontFamily:"var(--font-display)",
                    }}>SF</div>
                    <div>
                        <div style={{ fontFamily:"var(--font-display)", fontSize:14, fontWeight:800, color:"var(--text)" }}>Smart Factory</div>
                        <div style={{ fontFamily:"var(--font-mono)", fontSize:9, color:"var(--primary)", letterSpacing:1 }}>IIoT PLATFORM</div>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex:1, padding:"8px", overflowY:"auto" }}>
                {NAV_ITEMS.map((item, i) =>
                    item.section ? (
                        <div key={i} style={{
                            padding:"14px 8px 4px",
                            fontSize:10, fontWeight:700, letterSpacing:1,
                            color:"var(--text3)", textTransform:"uppercase",
                        }}>{item.section}</div>
                    ) : !visible.includes(item.id) ? null : (
                        <div key={`${item.id}-${i}`} onClick={() => setPage(item.id)} style={{
                            display:"flex", alignItems:"center", gap:8,
                            padding:"8px 10px", borderRadius:6, cursor:"pointer",
                            background: page===item.id ? "var(--primary-soft)" : "transparent",
                            color:       page===item.id ? "var(--primary)"      : "var(--text2)",
                            fontSize:13, fontWeight: page===item.id ? 600 : 500,
                            transition:"all .12s", marginBottom:1,
                        }}>
                            <span style={{ fontSize:12, width:16, textAlign:"center", opacity:page===item.id?1:.5 }}>
                                {item.icon}
                            </span>
                            {item.label}
                            {item.badge && (
                                <span style={{
                                    marginLeft:"auto", borderRadius:20,
                                    background: item.badgeColor+"22",
                                    border:`1px solid ${item.badgeColor}`,
                                    color:item.badgeColor,
                                    fontSize:9, padding:"1px 7px", fontFamily:"var(--font-mono)", fontWeight:600,
                                }}>{item.badge}</span>
                            )}
                        </div>
                    )
                )}
            </nav>

            {/* Footer */}
            <div style={{ padding:"12px 16px", borderTop:"1px solid var(--border)", background:"var(--bg1)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--green)",
                        display:"inline-block", animation:"blink 2s infinite" }} />
                    <span style={{ fontFamily:"var(--font-mono)", fontSize:10, color:"var(--text3)", fontWeight:500 }}>SISTEMA ONLINE</span>
                </div>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:9, color:"var(--text3)" }}>191.252.217.250</div>
            </div>
        </aside>
    );
}
