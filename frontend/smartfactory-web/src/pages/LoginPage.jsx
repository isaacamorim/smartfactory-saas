// src/pages/LoginPage.jsx
import { useState } from "react";
import { authAPI, setToken } from "../services/api";

export default function LoginPage({ onLogin }) {
    const [email,   setEmail]   = useState("admin@smartfactory.com");
    const [senha,   setSenha]   = useState("");
    const [loading, setLoading] = useState(false);
    const [erro,    setErro]    = useState(null);

    const handleLogin = async () => {
        setLoading(true);
        setErro(null);
        try {
            const data = await authAPI.login(email, senha);
            setToken(data.access_token);
            onLogin({ nome: email.split("@")[0].toUpperCase(), email });
        } catch (e) {
            setErro(e.message || "Credenciais inválidas");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleLogin();
    };

    return (
        <div style={{ width: "100vw", height: "100vh", display: "flex", background: "var(--bg0)", position: "relative", overflow: "hidden" }}>
            <div className="grid-bg" />

            {/* ── LEFT panel ── */}
            <div style={{
                width: "44%",
                background: "linear-gradient(160deg, var(--primary-dark) 0%, var(--primary) 60%, var(--primary-light) 100%)",
                display: "flex", flexDirection: "column",
                justifyContent: "center", alignItems: "center",
                padding: 60, position: "relative", overflow: "hidden",
            }}>
                <div style={{ position: "absolute", inset: 0, opacity: .08,
                    backgroundImage: "repeating-linear-gradient(45deg,#fff 0px,#fff 1px,transparent 1px,transparent 12px)" }} />

                {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h]) => (
                    <div key={`${v}${h}`} style={{
                        position:"absolute",[v]:28,[h]:28,width:36,height:36,
                        borderTop:    v==="top"    ? "2px solid rgba(255,255,255,.4)":"none",
                        borderBottom: v==="bottom" ? "2px solid rgba(255,255,255,.4)":"none",
                        borderLeft:   h==="left"   ? "2px solid rgba(255,255,255,.4)":"none",
                        borderRight:  h==="right"  ? "2px solid rgba(255,255,255,.4)":"none",
                    }} />
                ))}

                <svg width="240" height="240" viewBox="0 0 240 240" style={{ marginBottom:32, position:"relative", zIndex:1 }}>
                    {[108,86,66].map((r,i) => (
                        <g key={r}>
                            <circle cx="120" cy="120" r={r} fill="none" stroke="rgba(255,255,255,.15)" strokeWidth={8-i} />
                            <circle cx="120" cy="120" r={r} fill="none" stroke={`rgba(255,255,255,${.9-i*.15})`} strokeWidth={8-i}
                                strokeDasharray={2*Math.PI*r} strokeDashoffset={2*Math.PI*r*(i===0?.12:i===1?.09:.02)}
                                strokeLinecap="round"
                                style={{ transform:"rotate(-90deg)", transformOrigin:"120px 120px" }} />
                        </g>
                    ))}
                    <text x="120" y="113" textAnchor="middle" fontFamily="Rajdhani" fontSize="44" fontWeight="700" fill="#fff">75.3</text>
                    <text x="120" y="132" textAnchor="middle" fontFamily="Share Tech Mono" fontSize="10" fill="rgba(255,255,255,.7)" letterSpacing="3">OEE %</text>
                    <text x="120" y="152" textAnchor="middle" fontFamily="Share Tech Mono" fontSize="8"  fill="rgba(255,255,255,.5)" letterSpacing="2">DISP · PERF · QUAL</text>
                </svg>

                <div style={{ fontFamily:"var(--font-display)", fontSize:26, fontWeight:700, letterSpacing:4, color:"#fff", textAlign:"center", marginBottom:8, position:"relative", zIndex:1 }}>
                    SMART FACTORY
                </div>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:4, color:"rgba(255,255,255,.7)", textAlign:"center", marginBottom:36, position:"relative", zIndex:1 }}>
                    INDUSTRIAL MONITORING PLATFORM
                </div>
                <div style={{ display:"flex", gap:40, position:"relative", zIndex:1 }}>
                    {[["3","MÁQUINAS"],["75.3%","OEE MÉDIO"],["4.821","PRODUÇÃO"]].map(([v,l]) => (
                        <div key={l} style={{ textAlign:"center" }}>
                            <div style={{ fontFamily:"var(--font-display)", fontSize:28, fontWeight:700, color:"#fff" }}>{v}</div>
                            <div style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:2, color:"rgba(255,255,255,.6)" }}>{l}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── RIGHT: login ── */}
            <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", padding:60 }}>
                <div style={{ width:360 }} className="animate-up">
                    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:32 }}>
                        <div className="hex" style={{ width:44, height:44, background:"var(--primary)",
                            display:"flex", alignItems:"center", justifyContent:"center",
                            fontSize:16, fontWeight:900, color:"#fff", fontFamily:"var(--font-display)" }}>SF</div>
                        <div>
                            <div style={{ fontFamily:"var(--font-display)", fontSize:20, fontWeight:700, letterSpacing:2, color:"var(--text)" }}>SMART FACTORY</div>
                            <div style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:3, color:"var(--primary)" }}>IIoT PLATFORM v2.0.0</div>
                        </div>
                    </div>

                    <div style={{ marginBottom:28 }}>
                        <div style={{ fontFamily:"var(--font-display)", fontSize:18, fontWeight:700, letterSpacing:2, color:"var(--text)", marginBottom:4 }}>
                            Acessar Plataforma
                        </div>
                        <div style={{ fontFamily:"var(--font-mono)", fontSize:10, color:"var(--text3)" }}>
                            Entre com suas credenciais para continuar
                        </div>
                    </div>

                    <div style={{ marginBottom:16 }}>
                        <div style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:2, color:"var(--text3)", marginBottom:6 }}>EMAIL</div>
                        <input className="sf-input" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown} placeholder="seu@email.com" />
                    </div>

                    <div style={{ marginBottom: erro ? 12 : 28 }}>
                        <div style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:2, color:"var(--text3)", marginBottom:6 }}>SENHA</div>
                        <input className="sf-input" type="password" value={senha} onChange={e => setSenha(e.target.value)} onKeyDown={handleKeyDown} placeholder="••••••••" />
                    </div>

                    {erro && (
                        <div style={{
                            marginBottom:16, padding:"10px 14px",
                            background:"rgba(255,61,61,.08)", border:"1px solid var(--red)",
                            fontFamily:"var(--font-mono)", fontSize:11, color:"var(--red)",
                        }}>
                            ⚠ {erro}
                        </div>
                    )}

                    <button className="btn btn-solid" style={{ width:"100%", padding:13, fontSize:15 }} onClick={handleLogin} disabled={loading}>
                        {loading ? "AUTENTICANDO..." : "ENTRAR"}
                    </button>

                    {loading && (
                        <div style={{ marginTop:10 }}>
                            <div style={{ height:3, background:"var(--bg3)", overflow:"hidden", borderRadius:2 }}>
                                <div style={{ height:"100%", background:"var(--primary)", animation:"loadFill 1.2s ease forwards", borderRadius:2 }} />
                            </div>
                        </div>
                    )}

                    <div style={{ fontFamily:"var(--font-mono)", fontSize:10, color:"var(--text3)", textAlign:"center", marginTop:28 }}>
                        NH Alimentos · Plataforma Industrial IIoT
                    </div>
                </div>
            </div>
        </div>
    );
}
