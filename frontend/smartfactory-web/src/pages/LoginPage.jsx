// src/pages/LoginPage.jsx
import { useState, useEffect } from "react";
import { empresasAPI } from "../services/api";

export default function LoginPage({ onLogin, auth }) {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    const [stats, setStats] = useState({
        empresas: 0,
        linhas: 0,
        maquinas: 0,
    });

    useEffect(() => {
        async function loadStats() {
            try {
                const empresas = await empresasAPI.listar();

                let totalLinhas = 0;
                let totalMaquinas = 0;

                for (const emp of empresas) {
                    const linhas = await empresasAPI.listarLinhas(emp.id);

                    totalLinhas += linhas.length;

                    for (const linha of linhas) {
                        const maquinas =
                            await empresasAPI.listarMaquinasDaLinha(
                                emp.id,
                                linha.id
                            );

                        totalMaquinas += maquinas.length;
                    }
                }

                setStats({
                    empresas: empresas.length,
                    linhas: totalLinhas,
                    maquinas: totalMaquinas,
                });
            } catch (err) {
                console.error("Erro ao carregar estatísticas:", err);
            }
        }

        loadStats();
    }, []);

    const handleLogin = async () => {
        try {
            await auth.login(email, senha);
            onLogin();
        } catch { }
    };

    return (
        <div style={{ width:"100vw", height:"100vh", display:"flex", background:"var(--bg0)", position:"relative", overflow:"hidden" }}>
            <div className="grid-bg" />

            {/* ── LEFT panel ── */}
            <div
                style={{
                    flex: 1,
                    background: "linear-gradient(135deg, #9b0d13, #d52029)",
                    color: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "48px",
                    position: "relative",
                }}
            >
                {/* Logo */}
                <div style={{ marginBottom: 32 }}>

                    <div
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: 16,
                            background: "rgba(255,255,255,.12)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 28,
                            fontWeight: 800,
                            marginBottom: 20,
                        }}
                    >
                        SF
                    </div>

                    <h1
                        style={{
                            fontSize: 42,
                            fontWeight: 800,
                            margin: 0,
                        }}
                    >
                        Smart Factory
                    </h1>

                    <p
                        style={{
                            opacity: 0.85,
                            marginTop: 12,
                            fontSize: 16,
                            maxWidth: 500,
                            lineHeight: 1.6,
                        }}
                    >
                        Plataforma Industrial para Monitoramento,
                        OEE, Produção e Manutenção.
                    </p>

                </div>

                {/* Estatísticas Reais */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 16,
                        marginTop: 24,
                    }}
                >
                    <div
                        style={{
                            background: "rgba(255,255,255,.08)",
                            border: "1px solid rgba(255,255,255,.15)",
                            borderRadius: 12,
                            padding: 16,
                        }}
                    >
                        <div style={{ fontSize: 28, fontWeight: 700 }}>
                            {stats.empresas}
                        </div>
                        <div style={{ fontSize: 11, opacity: 0.8 }}>
                            EMPRESAS
                        </div>
                    </div>

                    <div
                        style={{
                            background: "rgba(255,255,255,.08)",
                            border: "1px solid rgba(255,255,255,.15)",
                            borderRadius: 12,
                            padding: 16,
                        }}
                    >
                        <div style={{ fontSize: 28, fontWeight: 700 }}>
                            {stats.linhas}
                        </div>
                        <div style={{ fontSize: 11, opacity: 0.8 }}>
                            LINHAS
                        </div>
                    </div>

                    <div
                        style={{
                            background: "rgba(255,255,255,.08)",
                            border: "1px solid rgba(255,255,255,.15)",
                            borderRadius: 12,
                            padding: 16,
                        }}
                    >
                        <div style={{ fontSize: 28, fontWeight: 700 }}>
                            {stats.maquinas}
                        </div>
                        <div style={{ fontSize: 11, opacity: 0.8 }}>
                            MÁQUINAS
                        </div>
                        </div>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>
                        {stats.usuarios}
                    </div>
                    <div style={{ fontSize: 11, opacity: 0.8 }}>
                        USUÁRIOS
                    </div>
                </div>

                {/* Rodapé */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 24,
                        left: 48,
                        fontSize: 11,
                        opacity: 0.7,
                        fontFamily: "var(--font-mono)",
                    }}
                >
                    OEE • PRODUÇÃO • MANUTENÇÃO • IIOT
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
                        Tecnologia NH · Plataforma Industrial IIoT
                    </div>
                </div>
            </div>
        </div>
    );
}
