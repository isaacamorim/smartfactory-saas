// src/pages/OEEPage.jsx
import { useState, useEffect } from "react";
import { PageHeader, OEEGauge, ProgressBar } from "../components/UI";
import { getStatus, getKPIs, getTurno, getSemana, calcularOEE } from "../services/mqttData";

const SERIAL = "EVA1000-00021";
const META_PAC_MIN = 45;
const DIAS = ["seg","ter","qua","qui","sex","sab","dom"];
const DIAS_LABEL = ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];
const TURNO_COLORS = ["var(--primary)", "var(--info)", "var(--green)"];

export default function OEEPage({ auth }) {
    const [oee,    setOee]    = useState(null);
    const [turno,  setTurno]  = useState(null);
    const [semana, setSemana] = useState(null);

    useEffect(() => {
        async function load() {
            const [s, k, t, sm] = await Promise.all([
                getStatus(SERIAL), getKPIs(SERIAL),
                getTurno(SERIAL),  getSemana(SERIAL),
            ]);
            setOee(calcularOEE(s, k, META_PAC_MIN));
            setTurno(t);
            setSemana(sm);
        }
        load();
        const i = setInterval(load, 10000);
        return () => clearInterval(i);
    }, []);

    if (!oee || !semana) return (
        <div style={{ padding:40, textAlign:"center", fontFamily:"var(--font-mono)", color:"var(--text3)" }}>
            Carregando OEE...
        </div>
    );

    const maxDia = Math.max(...DIAS.map(d => semana[d].reduce((a,b) => a+b, 0)), 1);

    return (
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            <PageHeader title="OEE" sub={`${SERIAL} · TEMPO REAL`}
                action={<span className="badge badge-live">● LIVE</span>} />

            {/* Gauges */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
                {[
                    ["OEE",             oee.oee,             "var(--primary)", 75],
                    ["Disponibilidade", oee.disponibilidade,  "var(--info)",   85],
                    ["Performance",     oee.performance,      "var(--green)",  90],
                    ["Qualidade",       oee.qualidade,        "var(--yellow)", 98],
                ].map(([l,v,c,meta]) => (
                    <div key={l} className="sf-card" style={{ padding:20, textAlign:"center" }}>
                        <OEEGauge value={v} size={120} color={c} label={l} />
                        <div style={{ marginTop:10, fontFamily:"var(--font-mono)", fontSize:10,
                            color: v >= meta ? "var(--green)" : "var(--red)" }}>
                            Meta: {meta}% · {v >= meta ? "✓" : "✕"}
                        </div>
                    </div>
                ))}
            </div>

            {/* Produção por turno (hoje) */}
            <div className="sf-card">
                <div className="sf-card-header">
                    <span className="sf-card-title">Produção por Turno — Hoje</span>
                    <span style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--text3)" }}>
                        Lote #{turno.lote}
                    </span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:0 }}>
                    {[turno.t1, turno.t2, turno.t3].map((v, i) => (
                        <div key={i} style={{
                            padding:"20px 24px",
                            borderRight: i < 2 ? "1px solid var(--border)" : "none",
                            borderLeft: i === 0 ? `3px solid ${TURNO_COLORS[i]}` : "none",
                        }}>
                            <div style={{ fontSize:11, fontWeight:600, color:"var(--text3)",
                                textTransform:"uppercase", marginBottom:8 }}>
                                Turno {i+1}
                            </div>
                            <div style={{ fontFamily:"var(--font-display)", fontSize:40, fontWeight:800,
                                color: v > 0 ? TURNO_COLORS[i] : "var(--text3)" }}>
                                {v.toLocaleString("pt-BR")}
                            </div>
                            <div style={{ fontFamily:"var(--font-mono)", fontSize:10, color:"var(--text3)", marginTop:4 }}>
                                unidades
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Gráfico semanal por turno */}
            <div className="sf-card">
                <div className="sf-card-header">
                    <span className="sf-card-title">Produção Semanal por Turno</span>
                </div>
                <div className="sf-card-body">
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:8 }}>
                        {DIAS.map((dia, di) => {
                            const [t1,t2,t3] = semana[dia];
                            const total = t1+t2+t3;
                            return (
                                <div key={dia} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                                    {/* Barra empilhada */}
                                    <div style={{ width:"100%", height:120, display:"flex", flexDirection:"column-reverse",
                                        background:"var(--bg2)", borderRadius:4, overflow:"hidden", position:"relative" }}>
                                        {[t1,t2,t3].map((v,i) => (
                                            <div key={i} style={{
                                                height: `${(v/maxDia)*100}%`,
                                                background: TURNO_COLORS[i],
                                                opacity: v > 0 ? 1 : 0,
                                                transition:"height .5s",
                                                borderTop: `1px solid rgba(255,255,255,.2)`,
                                            }} />
                                        ))}
                                    </div>
                                    <div style={{ fontFamily:"var(--font-mono)", fontSize:9, color:"var(--text3)" }}>
                                        {DIAS_LABEL[di]}
                                    </div>
                                    <div style={{ fontFamily:"var(--font-display)", fontSize:12, fontWeight:700,
                                        color: total > 0 ? "var(--text)" : "var(--text3)" }}>
                                        {total > 0 ? total.toLocaleString("pt-BR") : "—"}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {/* Legenda */}
                    <div style={{ display:"flex", gap:16, marginTop:12 }}>
                        {["Turno 1","Turno 2","Turno 3"].map((l,i) => (
                            <div key={l} style={{ display:"flex", alignItems:"center", gap:6 }}>
                                <div style={{ width:10, height:10, borderRadius:2, background:TURNO_COLORS[i] }} />
                                <span style={{ fontFamily:"var(--font-mono)", fontSize:10, color:"var(--text3)" }}>{l}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
