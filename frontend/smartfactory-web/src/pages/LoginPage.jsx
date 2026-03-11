// src/pages/LoginPage.jsx
import { useState } from "react";

export default function LoginPage({ onLogin, auth }) {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    const handleLogin = async () => {
        try {
            await auth.login(email, senha);
            onLogin();
        } catch {}  // erro já está em auth.erro
    };

    return (
        <div style={{ width:"100vw", height:"100vh", display:"flex", background:"var(--bg0)", position:"relative", overflow:"hidden" }}>
            <div className="grid-bg" />

            {/* ── LEFT panel ── */}
            <div style={{
                width:"44%",
                background:"linear-gradient(160deg, var(--primary-dark) 0%, var(--primary) 60%, var(--primary-light) 100%)",
                display:"flex", flexDirection:"column",
                justifyContent:"center", alignItems:"center",
                padding:60, position:"relative", overflow:"hidden",
            }}>
                <div style={{ position:"absolute", inset:0, opacity:.06,
                    backgroundImage:"repeating-linear-gradient(45deg,#fff 0px,#fff 1px,transparent 1px,transparent 12px)" }} />

                <svg width="220" height="220" viewBox="0 0 220 220" style={{ marginBottom:32, position:"relative", zIndex:1 }}>
                    {[98,76,56].map((r,i) => (
                        <g key={r}>
                            <circle cx="110" cy="110" r={r} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth={7-i} />
                            <circle cx="110" cy="110" r={r} fill="none" stroke={`rgba(255,255,255,${.9-i*.15})`} strokeWidth={7-i}
                                strokeDasharray={2*Math.PI*r} strokeDashoffset={2*Math.PI*r*(i===0?.12:i===1?.09:.02)}
                                strokeLinecap="round"
                                style={{ transform:"rotate(-90deg)", transformOrigin:"110px 110px" }} />
                        </g>
                    ))}
                    <text x="110" y="103" textAnchor="middle" fontFamily="Plus Jakarta Sans" fontSize="42" fontWeight="800" fill="#fff">75.3</text>
                    <text x="110" y="122" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9"  fill="rgba(255,255,255,.7)" letterSpacing="3">OEE %</text>
                    <text x="110" y="140" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8"  fill="rgba(255,255,255,.5)" letterSpacing="2">DISP · PERF · QUAL</text>
                </svg>

                <div style={{ fontFamily:"var(--font-display)", fontSize:24, fontWeight:800,
                    letterSpacing:2, color:"#fff", textAlign:"center", marginBottom:6, position:"relative", zIndex:1 }}>
                    SMART FACTORY
                </div>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:4,
                    color:"rgba(255,255,255,.65)", textAlign:"center", marginBottom:40, position:"relative", zIndex:1 }}>
                    INDUSTRIAL MONITORING PLATFORM
                </div>

                <div style={{ display:"flex", gap:40, position:"relative", zIndex:1 }}>
                    {[["3","MÁQUINAS"],["75.3%","OEE MÉDIO"],["4.821","PRODUÇÃO"]].map(([v,l]) => (
                        <div key={l} style={{ textAlign:"center" }}>
                            <div style={{ fontFamily:"var(--font-display)", fontSize:26, fontWeight:800, color:"#fff" }}>{v}</div>
                            <div style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:2, color:"rgba(255,255,255,.55)" }}>{l}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── RIGHT: login form ── */}
            <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", padding:60 }}>
                <div style={{ width:360 }} className="animate-up">
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:32 }}>
                        <div style={{
                            width:40, height:40, background:"var(--primary)", borderRadius:8,
                            display:"flex", alignItems:"center", justifyContent:"center",
                            fontSize:14, fontWeight:800, color:"#fff", fontFamily:"var(--font-display)",
                        }}>SF</div>
                        <div>
                            <div style={{ fontFamily:"var(--font-display)", fontSize:18, fontWeight:800, letterSpacing:1, color:"var(--text)" }}>Smart Factory</div>
                            <div style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:3, color:"var(--primary)" }}>IIoT PLATFORM v2.0</div>
                        </div>
                    </div>

                    <div style={{ marginBottom:24 }}>
                        <div style={{ fontFamily:"var(--font-display)", fontSize:20, fontWeight:800, color:"var(--text)", marginBottom:4 }}>
                            Entrar na plataforma
                        </div>
                        <div style={{ fontSize:13, color:"var(--text3)" }}>
                            Use suas credenciais para acessar
                        </div>
                    </div>

                    <div style={{ marginBottom:14 }}>
                        <div style={{ fontSize:11, fontWeight:600, color:"var(--text2)", marginBottom:5, textTransform:"uppercase", letterSpacing:.3 }}>E-mail</div>
                        <input className="sf-input" value={email} onChange={e => setEmail(e.target.value)}
                            onKeyDown={e => e.key==="Enter" && handleLogin()}
                            placeholder="seu@email.com" autoFocus />
                    </div>

                    <div style={{ marginBottom: auth.erro ? 12 : 24 }}>
                        <div style={{ fontSize:11, fontWeight:600, color:"var(--text2)", marginBottom:5, textTransform:"uppercase", letterSpacing:.3 }}>Senha</div>
                        <input className="sf-input" type="password" value={senha} onChange={e => setSenha(e.target.value)}
                            onKeyDown={e => e.key==="Enter" && handleLogin()}
                            placeholder="••••••••" />
                    </div>

                    {auth.erro && (
                        <div style={{
                            marginBottom:16, padding:"10px 14px", borderRadius:6,
                            background:"#fef2f2", border:"1px solid #fca5a5",
                            fontSize:13, color:"var(--red)", fontWeight:500,
                        }}>
                            ⚠ {auth.erro}
                        </div>
                    )}

                    <button className="btn btn-solid" style={{ width:"100%", padding:12, fontSize:14 }}
                        onClick={handleLogin} disabled={auth.loading}>
                        {auth.loading ? "Autenticando..." : "Entrar"}
                    </button>

                    {auth.loading && (
                        <div style={{ marginTop:8 }}>
                            <div style={{ height:2, background:"var(--bg3)", overflow:"hidden", borderRadius:99 }}>
                                <div style={{ height:"100%", background:"var(--primary)", animation:"loadFill 1.4s ease forwards" }} />
                            </div>
                        </div>
                    )}

                    <div style={{ fontSize:11, color:"var(--text3)", textAlign:"center", marginTop:28 }}>
                        NH Alimentos · Plataforma Industrial IIoT
                    </div>
                </div>
            </div>
        </div>
    );
}
