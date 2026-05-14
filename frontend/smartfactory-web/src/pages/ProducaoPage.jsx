// src/pages/ProducaoPage.jsx
import { useState, useEffect } from "react";
import { PageHeader, ProgressBar } from "../components/UI";
import { getStatus, getKPIs, getTurno, getSemana, getConfig, getPesos } from "../services/mqttData";

const SERIAL = "EVA1000-00021";
const DIAS = ["seg","ter","qua","qui","sex","sab","dom"];
const DIAS_LABEL = ["Segunda","Terça","Quarta","Quinta","Sexta","Sábado","Domingo"];

export default function ProducaoPage({ auth }) {
    const [data, setData] = useState(null);

    useEffect(() => {
        async function load() {
            const [status, kpis, turno, semana, config, pesos] = await Promise.all([
                getStatus(SERIAL), getKPIs(SERIAL), getTurno(SERIAL),
                getSemana(SERIAL), getConfig(SERIAL), getPesos(SERIAL),
            ]);
            setData({ status, kpis, turno, semana, config, pesos });
        }
        load();
        const i = setInterval(load, 8000);
        return () => clearInterval(i);
    }, []);

    if (!data) return (
        <div style={{ padding:40, textAlign:"center", fontFamily:"var(--font-mono)", color:"var(--text3)" }}>
            Carregando produção...
        </div>
    );

    const { status, kpis, turno, semana, config, pesos } = data;
    const totalSemana = DIAS.reduce((acc, d) => acc + semana[d].reduce((a,b)=>a+b,0), 0);
    const qualidadePct = kpis.ok + kpis.nok > 0
        ? ((kpis.ok / (kpis.ok + kpis.nok)) * 100).toFixed(1)
        : "0.0";

    return (
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            <PageHeader title="Produção" sub={`${SERIAL} · LOTE #${turno.lote}`}
                action={<span className="badge badge-live">● LIVE</span>} />

            {/* KPIs */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
                {[
                    ["Total Semana",    totalSemana.toLocaleString("pt-BR") + " un", "var(--text)"],
                    ["Total Turno",     turno.t1.toLocaleString("pt-BR") + " un",    "var(--primary)"],
                    ["Qualidade",       qualidadePct + "%",                           +qualidadePct >= 98 ? "var(--green)" : "var(--orange)"],
                    ["Peso Referência", (config.peso_ref/10).toFixed(1) + " kg",     "var(--info)"],
                ].map(([l,v,c]) => (
                    <div key={l} className="sf-card" style={{ padding:16 }}>
                        <div style={{ fontSize:11, fontWeight:600, color:"var(--text3)", textTransform:"uppercase", marginBottom:8 }}>{l}</div>
                        <div style={{ fontFamily:"var(--font-display)", fontSize:28, fontWeight:800, color:c }}>{v}</div>
                    </div>
                ))}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                {/* Turnos de hoje */}
                <div className="sf-card">
                    <div className="sf-card-header"><span className="sf-card-title">Produção por Turno — Hoje</span></div>
                    <div className="sf-card-body" style={{ display:"flex", flexDirection:"column", gap:16 }}>
                        {[["Turno 1", turno.t1, "var(--primary)"],
                          ["Turno 2", turno.t2, "var(--info)"],
                          ["Turno 3", turno.t3, "var(--green)"]].map(([l,v,c]) => (
                            <div key={l}>
                                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                                    <span style={{ fontSize:13, fontWeight:500 }}>{l}</span>
                                    <span style={{ fontFamily:"var(--font-mono)", fontSize:12, color:c, fontWeight:600 }}>
                                        {v.toLocaleString("pt-BR")} un
                                    </span>
                                </div>
                                <div style={{ height:8, background:"var(--bg3)", borderRadius:99, overflow:"hidden" }}>
                                    <div style={{ width:`${Math.min((v/2500)*100,100)}%`, height:"100%",
                                        background:c, borderRadius:99, transition:"width .5s" }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Balanço de qualidade */}
                <div className="sf-card">
                    <div className="sf-card-header"><span className="sf-card-title">Balanço de Qualidade</span></div>
                    <div className="sf-card-body" style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        {[
                            ["Pacotes OK",  kpis.ok,  "var(--green)"],
                            ["Pacotes NOK", kpis.nok, "var(--red)"],
                        ].map(([l,v,c]) => (
                            <div key={l}>
                                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                                    <span style={{ fontSize:13, fontWeight:500 }}>{l}</span>
                                    <span style={{ fontFamily:"var(--font-mono)", fontSize:12, color:c, fontWeight:700 }}>{v.toLocaleString("pt-BR")}</span>
                                </div>
                                <div style={{ height:10, background:"var(--bg3)", borderRadius:99, overflow:"hidden" }}>
                                    <div style={{ width:`${(v/(kpis.ok+kpis.nok||1))*100}%`, height:"100%",
                                        background:c, borderRadius:99, transition:"width .5s" }} />
                                </div>
                            </div>
                        ))}
                        <div style={{ marginTop:8, padding:12, background:"var(--bg1)", border:"1px solid var(--border)", borderRadius:6 }}>
                            <div style={{ display:"flex", justifyContent:"space-between" }}>
                                <span style={{ fontSize:12, color:"var(--text2)" }}>Índice de Qualidade</span>
                                <span style={{ fontFamily:"var(--font-display)", fontSize:22, fontWeight:800,
                                    color: +qualidadePct >= 98 ? "var(--green)" : "var(--orange)" }}>
                                    {qualidadePct}%
                                </span>
                            </div>
                        </div>

                        {/* Tolerâncias */}
                        <div style={{ padding:"10px 14px", background:"var(--bg1)", border:"1px solid var(--border)", borderRadius:6,
                            fontFamily:"var(--font-mono)", fontSize:10, color:"var(--text3)", lineHeight:2 }}>
                            Peso ref: <span style={{ color:"var(--primary)" }}>{(config.peso_ref/10).toFixed(1)} kg</span><br/>
                            Tol. mín: <span style={{ color:"var(--green)" }}>{(config.tol_min/10).toFixed(1)} kg</span> &nbsp;|&nbsp;
                            Tol. máx: <span style={{ color:"var(--orange)" }}>{(config.tol_max/10).toFixed(1)} kg</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabela semanal */}
            <div className="sf-card">
                <div className="sf-card-header"><span className="sf-card-title">Produção Semanal</span></div>
                <table className="sf-table" style={{ width:"100%" }}>
                    <thead>
                        <tr>
                            <th>Dia</th>
                            <th style={{ textAlign:"right" }}>Turno 1</th>
                            <th style={{ textAlign:"right" }}>Turno 2</th>
                            <th style={{ textAlign:"right" }}>Turno 3</th>
                            <th style={{ textAlign:"right" }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {DIAS.map((d, i) => {
                            const [t1,t2,t3] = semana[d];
                            const total = t1+t2+t3;
                            return (
                                <tr key={d}>
                                    <td style={{ fontWeight:500 }}>{DIAS_LABEL[i]}</td>
                                    <td style={{ textAlign:"right", fontFamily:"var(--font-mono)", color:"var(--primary)" }}>
                                        {t1 > 0 ? t1.toLocaleString("pt-BR") : "—"}
                                    </td>
                                    <td style={{ textAlign:"right", fontFamily:"var(--font-mono)", color:"var(--info)" }}>
                                        {t2 > 0 ? t2.toLocaleString("pt-BR") : "—"}
                                    </td>
                                    <td style={{ textAlign:"right", fontFamily:"var(--font-mono)", color:"var(--green)" }}>
                                        {t3 > 0 ? t3.toLocaleString("pt-BR") : "—"}
                                    </td>
                                    <td style={{ textAlign:"right", fontFamily:"var(--font-display)", fontWeight:700,
                                        color: total > 0 ? "var(--text)" : "var(--text3)" }}>
                                        {total > 0 ? total.toLocaleString("pt-BR") : "—"}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
