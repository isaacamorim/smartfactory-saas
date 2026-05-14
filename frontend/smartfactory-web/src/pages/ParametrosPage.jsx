// src/pages/ParametrosPage.jsx
import { useState, useEffect } from "react";
import { PageHeader, Feedback } from "../components/UI";
import EmpresaSelector from "../components/EmpresaSelector";
import { maquinasAPI, parametrosAPI } from "../services/api";
import { useApi } from "../hooks/useApi";

// ─── Componentes base ────────────────────────────────────────────────────────

function Toggle({ value, onChange }) {
    return (
        <div onClick={() => onChange(!value)} style={{
            width:48, height:26, borderRadius:13, cursor:"pointer", flexShrink:0,
            background: value ? "var(--primary)" : "var(--bg3)",
            position:"relative", transition:"background .2s",
            boxShadow: value ? "0 0 0 3px var(--primary-soft)" : "none",
        }}>
            <div style={{
                position:"absolute", top:3, left: value ? 25 : 3,
                width:20, height:20, borderRadius:"50%", background:"#fff",
                boxShadow:"0 1px 4px rgba(0,0,0,.25)", transition:"left .2s",
            }} />
        </div>
    );
}

function NumField({ value, onChange, min, max, step=1, unit="" }) {
    const dec = () => onChange(+(Math.max(min ?? -Infinity, +value - step)).toFixed(3));
    const inc = () => onChange(+(Math.min(max ?? Infinity,  +value + step)).toFixed(3));
    return (
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
            <button onClick={dec} style={{
                width:26, height:26, border:"1px solid var(--border2)", borderRadius:6,
                background:"var(--bg0)", cursor:"pointer", fontSize:14, fontWeight:700,
                color:"var(--text2)", display:"flex", alignItems:"center", justifyContent:"center",
            }}>−</button>
            <div style={{
                minWidth:72, textAlign:"center", padding:"4px 8px",
                background:"#1a1a2e", border:"1px solid #333", borderRadius:6,
                fontFamily:"var(--font-mono)", fontSize:13, fontWeight:600, color:"#e0e0ff",
            }}>{value}{unit}</div>
            <button onClick={inc} style={{
                width:26, height:26, border:"1px solid var(--border2)", borderRadius:6,
                background:"var(--bg0)", cursor:"pointer", fontSize:14, fontWeight:700,
                color:"var(--text2)", display:"flex", alignItems:"center", justifyContent:"center",
            }}>+</button>
        </div>
    );
}

function ParamRow({ label, sub, children, destaque }) {
    return (
        <div style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"11px 16px", gap:12,
            background: destaque ? "var(--primary-soft)" : "transparent",
            borderBottom:"1px solid var(--border)",
        }}>
            <div>
                <div style={{ fontSize:13, color:"var(--text)", fontWeight:500 }}>{label}</div>
                {sub && <div style={{ fontFamily:"var(--font-mono)", fontSize:9, color:"var(--text3)", marginTop:1 }}>{sub}</div>}
            </div>
            {children}
        </div>
    );
}

function Section({ title, icon, accent="var(--primary)", children }) {
    return (
        <div className="sf-card">
            <div className="sf-card-header" style={{ borderLeft:`3px solid ${accent}`, paddingLeft:17 }}>
                <span style={{ fontSize:13 }}>{icon}</span>
                <span className="sf-card-title" style={{ marginLeft:8 }}>{title}</span>
            </div>
            <div>{children}</div>
        </div>
    );
}

function AnguloHeader() {
    return (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 130px 130px", gap:12,
            padding:"7px 16px", borderBottom:"2px solid var(--border2)", background:"var(--bg1)" }}>
            <span style={{ fontSize:11, fontWeight:700, color:"var(--text3)", textTransform:"uppercase" }}>Função</span>
            <span style={{ fontSize:11, fontWeight:700, color:"var(--text3)", textTransform:"uppercase", textAlign:"center" }}>Início</span>
            <span style={{ fontSize:11, fontWeight:700, color:"var(--text3)", textTransform:"uppercase", textAlign:"center" }}>Fim</span>
        </div>
    );
}

function AnguloRow({ label, sub, inicio, fim, onInicio, onFim, temFim=true, sufixoFim="°" }) {
    return (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 130px 130px", alignItems:"center",
            gap:12, padding:"10px 16px", borderBottom:"1px solid var(--border)" }}>
            <div>
                <div style={{ fontSize:13, fontWeight:500, color:"var(--text)" }}>{label}</div>
                {sub && <div style={{ fontFamily:"var(--font-mono)", fontSize:9, color:"var(--text3)" }}>{sub}</div>}
            </div>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                <NumField value={inicio} onChange={onInicio} min={0} max={sufixoFim==="°"?359:9999} step={sufixoFim==="s"?.1:1} unit="°" />
            </div>
            {temFim ? (
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                    <NumField value={fim} onChange={onFim} min={0} max={sufixoFim==="°"?359:9999} step={sufixoFim==="s"?.1:1} unit={sufixoFim} />
                </div>
            ) : <div />}
        </div>
    );
}

// ─── Tabs ────────────────────────────────────────────────────────────────────

function Tabs({ options, active, onSelect }) {
    return (
        <div style={{ display:"flex", gap:8 }}>
            {options.map(([id, label]) => (
                <button key={id} onClick={() => onSelect(id)} style={{
                    padding:"8px 18px", borderRadius:6, cursor:"pointer", fontSize:13,
                    border:"none", fontFamily:"var(--font-body)",
                    fontWeight: active===id ? 700 : 500,
                    background: active===id ? "var(--primary)" : "var(--bg2)",
                    color:      active===id ? "#fff"           : "var(--text2)",
                    transition:"all .15s",
                }}>{label}</button>
            ))}
        </div>
    );
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULTS = {
    temp_horizontal:35, temp_vertical:30,
    sel_pesagem:false, sel_fim_produto:false, sel_fim_fita:false, sel_fim_embalagem:false,
    sel_emerg_enfardadeira:false, sel_pacote_vazio:false, sel_inv_rs485:false,
    sel_reserva_q12:false, sel_reserva_q13:false,
    tipo_dosador:1,
    sel_datador:true, sel_temp_datador:false,
    vel_motor_rpm:1720, relacao_reducao:30.85, pacotes_min:40.0,
    ang_datador_ini:110, ang_datador_fim:150,
    ang_solda_v_ini:320, ang_solda_v_fim:100,
    ang_pulso_sv_ini:300,
    ang_solda_h_ini:160, ang_solda_h_fim:220,
    ang_pulso_sh_ini:150,
    ang_esfr_h_ini:200, ang_esfr_h_fim:320,
    ang_dos_rot_ini:0, ang_dos_rot_fim:1,
    ang_gav_sup_ini:180, ang_gav_sup_fim:0.5,
    ang_gav_inf_ini:30,  ang_gav_inf_fim:0.3,
    ang_abre_fecha_ini:90, ang_abre_fecha_fim:350,
    ang_q15_ini:0, ang_q15_fim:0,
    ang_alim_ini:0, ang_fim_ciclo:50, ang_esteira_fim:0,
};

const DOSADORES = [
    { id:0, label:"Rotativo", icon:"◎" },
    { id:1, label:"Gaveta",   icon:"▤" },
    { id:2, label:"Rosca",    icon:"⌀" },
    { id:3, label:"Balança",  icon:"⚖" },
];

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function ParametrosPage({ auth }) {
    const [empresa,  setEmpresa]  = useState(null);
    const [maquina,  setMaquina]  = useState(null);  // máquina selecionada
    const [params,   setParams]   = useState(DEFAULTS);
    const [tab,      setTab]      = useState("angulos");
    const [subTab,   setSubTab]   = useState("ang1");
    const [selTab,   setSelTab]   = useState("funcoes");
    const [feedback, setFeedback] = useState(null);
    const [salvando, setSalvando] = useState(false);
    const [carregando, setCarregando] = useState(false);

    const { data: maquinas } = useApi(
        () => empresa ? maquinasAPI.listarPorEmpresa(empresa.id) : Promise.resolve([]),
        [empresa?.id]
    );

    // Carregar parâmetros ao selecionar máquina
    useEffect(() => {
        if (!maquina) return;
        setCarregando(true);
        parametrosAPI.obter(maquina.id)
            .then(data => { setParams({ ...DEFAULTS, ...data }); })
            .catch(() => { setParams({ ...DEFAULTS, maquina_id: maquina.id }); })
            .finally(() => setCarregando(false));
    }, [maquina?.id]);

    const set = (k, v) => setParams(p => ({ ...p, [k]: v }));
    const fb  = (tipo, msg) => { setFeedback({ tipo, msg }); setTimeout(() => setFeedback(null), 5000); };

    const handleSalvar = async () => {
        if (!maquina) return fb("erro", "Selecione uma máquina primeiro.");
        setSalvando(true);
        try {
            await parametrosAPI.salvar(maquina.id, { ...params, maquina_id: maquina.id });
            fb("ok", `Parâmetros de ${maquina.serial_number} salvos no banco!`);
        } catch (e) {
            fb("erro", e.message);
        } finally {
            setSalvando(false);
        }
    };

    const freqHz = ((params.pacotes_min * params.relacao_reducao / params.vel_motor_rpm) * 60).toFixed(2);

    return (
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            <PageHeader
                title="Parâmetros da Máquina"
                sub="EVA1000 · CONFIGURAÇÃO E BACKUP NO BANCO"
                action={
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                        {maquina && (
                            <span style={{ fontFamily:"var(--font-mono)", fontSize:10,
                                color:"var(--orange)", background:"#fff7ed",
                                border:"1px solid var(--orange)", padding:"3px 10px", borderRadius:99 }}>
                                ⚠ MQTT WRITE PENDENTE
                            </span>
                        )}
                        <button className="btn btn-solid" onClick={handleSalvar}
                            disabled={salvando || !maquina}>
                            {salvando ? "Salvando..." : "💾 Salvar no Banco"}
                        </button>
                    </div>
                }
            />

            <Feedback {...(feedback ?? {})} onClose={() => setFeedback(null)} />

            {/* Seletor de empresa + máquina */}
            <div className="sf-card" style={{ padding:20, display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <div>
                    <div style={{ fontSize:11, fontWeight:600, color:"var(--text3)",
                        textTransform:"uppercase", letterSpacing:.5, marginBottom:8 }}>Empresa</div>
                    <EmpresaSelector usuario={auth.usuario} onSelect={emp => { setEmpresa(emp); setMaquina(null); }} empresaAtual={empresa} />
                </div>
                <div>
                    <div style={{ fontSize:11, fontWeight:600, color:"var(--text3)",
                        textTransform:"uppercase", letterSpacing:.5, marginBottom:8 }}>Máquina</div>
                    {empresa ? (
                        <select className="sf-select" value={maquina?.id ?? ""}
                            onChange={e => {
                                const m = (maquinas ?? []).find(m => m.id === +e.target.value);
                                setMaquina(m ?? null);
                            }}>
                            <option value="">— selecione a máquina —</option>
                            {(maquinas ?? []).map(m => (
                                <option key={m.id} value={m.id}>{m.serial_number} · {m.modelo}</option>
                            ))}
                        </select>
                    ) : (
                        <div style={{ padding:"10px 14px", background:"var(--bg1)",
                            border:"1px solid var(--border)", borderRadius:6,
                            fontSize:13, color:"var(--text3)" }}>
                            Selecione a empresa primeiro
                        </div>
                    )}
                </div>
            </div>

            {!maquina ? (
                <div className="sf-card" style={{ padding:"48px 24px", textAlign:"center" }}>
                    <div style={{ fontSize:32, marginBottom:12, opacity:.2 }}>⊞</div>
                    <div style={{ fontSize:13, color:"var(--text3)" }}>
                        Selecione a empresa e a máquina para ver e editar os parâmetros.
                    </div>
                </div>
            ) : carregando ? (
                <div className="sf-card" style={{ padding:"32px", textAlign:"center" }}>
                    <div style={{ fontFamily:"var(--font-mono)", fontSize:12, color:"var(--text3)" }}>
                        Carregando parâmetros de {maquina.serial_number}...
                    </div>
                </div>
            ) : (<>

                {/* ── Tabs principais ── */}
                <Tabs
                    options={[["angulos","⟳ Ângulos e Tempos"], ["seletoras","⚙ Seletoras"], ["motores","◎ Motores"]]}
                    active={tab} onSelect={setTab}
                />

                {/* ════ ÂNGULOS ════ */}
                {tab === "angulos" && (<>
                    <Tabs
                        options={[["ang1","Página 1 — Soldas"], ["ang2","Página 2 — Gavetas"]]}
                        active={subTab} onSelect={setSubTab}
                    />
                    {subTab === "ang1" && (
                        <Section title="Soldas e Esfriamento" icon="⟳" accent="var(--primary)">
                            <AnguloHeader />
                            <AnguloRow label="Datador"              sub="CMP_Inicio[0]/CMP_Fim[0]" inicio={params.ang_datador_ini}  onInicio={v=>set("ang_datador_ini",v)}  fim={params.ang_datador_fim}  onFim={v=>set("ang_datador_fim",v)} />
                            <AnguloRow label="Solda Vertical"       sub="CMP_Inicio[2]/CMP_Fim[2]" inicio={params.ang_solda_v_ini}  onInicio={v=>set("ang_solda_v_ini",v)}  fim={params.ang_solda_v_fim}  onFim={v=>set("ang_solda_v_fim",v)} />
                            <AnguloRow label="Pulso Solda Vertical" sub="CMP_Inicio[11]"            inicio={params.ang_pulso_sv_ini} onInicio={v=>set("ang_pulso_sv_ini",v)} temFim={false} />
                            <AnguloRow label="Solda Horizontal"     sub="CMP_Inicio[3]/CMP_Fim[3]" inicio={params.ang_solda_h_ini}  onInicio={v=>set("ang_solda_h_ini",v)}  fim={params.ang_solda_h_fim}  onFim={v=>set("ang_solda_h_fim",v)} />
                            <AnguloRow label="Pulso Solda Horiz."   sub="CMP_Inicio[4]"            inicio={params.ang_pulso_sh_ini} onInicio={v=>set("ang_pulso_sh_ini",v)} temFim={false} />
                            <AnguloRow label="Esfriamento Horiz."   sub="CMP_Inicio[5]/CMP_Fim[5]" inicio={params.ang_esfr_h_ini}   onInicio={v=>set("ang_esfr_h_ini",v)}   fim={params.ang_esfr_h_fim}   onFim={v=>set("ang_esfr_h_fim",v)} />
                        </Section>
                    )}
                    {subTab === "ang2" && (
                        <Section title="Gavetas e Ciclo" icon="⟳" accent="var(--info)">
                            <AnguloHeader />
                            <AnguloRow label="Dosador Rotativo"        inicio={params.ang_dos_rot_ini}    onInicio={v=>set("ang_dos_rot_ini",v)}    fim={params.ang_dos_rot_fim}    onFim={v=>set("ang_dos_rot_fim",v)}    sufixoFim="x" />
                            <AnguloRow label="Gaveta Superior"          inicio={params.ang_gav_sup_ini}    onInicio={v=>set("ang_gav_sup_ini",v)}    fim={params.ang_gav_sup_fim}    onFim={v=>set("ang_gav_sup_fim",v)}    sufixoFim="s" />
                            <AnguloRow label="Gaveta Inferior"          inicio={params.ang_gav_inf_ini}    onInicio={v=>set("ang_gav_inf_ini",v)}    fim={params.ang_gav_inf_fim}    onFim={v=>set("ang_gav_inf_fim",v)}    sufixoFim="s" />
                            <AnguloRow label="Abre e Fecha"             inicio={params.ang_abre_fecha_ini} onInicio={v=>set("ang_abre_fecha_ini",v)} fim={params.ang_abre_fecha_fim} onFim={v=>set("ang_abre_fecha_fim",v)} />
                            <AnguloRow label="Saída Reserva Q15"        inicio={params.ang_q15_ini}        onInicio={v=>set("ang_q15_ini",v)}        fim={params.ang_q15_fim}        onFim={v=>set("ang_q15_fim",v)}        sufixoFim="s" />
                            <AnguloRow label="Alimentador"              inicio={params.ang_alim_ini}       onInicio={v=>set("ang_alim_ini",v)}       temFim={false} />
                            <AnguloRow label="Posição Fim de Ciclo"     inicio={params.ang_fim_ciclo}      onInicio={v=>set("ang_fim_ciclo",v)}       temFim={false} />
                            <AnguloRow label="Desliga Esteira Após Fim" inicio={params.ang_esteira_fim}    onInicio={v=>set("ang_esteira_fim",v)}    temFim={false} />
                        </Section>
                    )}
                </>)}

                {/* ════ SELETORAS ════ */}
                {tab === "seletoras" && (<>
                    <Tabs
                        options={[["funcoes","Funções"], ["dosador","Dosador"], ["datador","Datador"]]}
                        active={selTab} onSelect={setSelTab}
                    />
                    {selTab === "funcoes" && (
                        <Section title="Seletoras — Funções" icon="⚙" accent="var(--orange)">
                            {[
                                ["sel_pesagem",             "Sistema de Pesagem",           "Sel_Sistema_Pesagem"],
                                ["sel_fim_produto",         "Fim de Produto",               "Sel_Fim_Produto"],
                                ["sel_fim_fita",            "Fim Fita Datador",             "Sel_Fim_Fita_Datador"],
                                ["sel_fim_embalagem",       "Fim Embalagem",                "Sel_Fim_Embalagem"],
                                ["sel_emerg_enfardadeira",  "Emergência Enfardadeira",      "Sel_Emerg_Enfardadeira"],
                                ["sel_pacote_vazio",        "Parada com Pacote Vazio",      "SEL_PARA_VAZIO"],
                                ["sel_inv_rs485",           "Inversor via RS-485 (ATV320)", "SEL_INV_RS485_OU_ANALOG"],
                                ["sel_reserva_q12",         "Habilita Reserva Q12",         "Sel_Reserva_Q12"],
                                ["sel_reserva_q13",         "Habilita Reserva Q13",         "Sel_Reserva_Q13"],
                            ].map(([key, label, clpVar]) => (
                                <ParamRow key={key} label={label} sub={clpVar}>
                                    <Toggle value={params[key]} onChange={v => set(key, v)} />
                                </ParamRow>
                            ))}
                        </Section>
                    )}
                    {selTab === "dosador" && (
                        <Section title="Tipo de Dosador" icon="▤" accent="var(--green)">
                            <div style={{ padding:24, display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
                                {DOSADORES.map(d => (
                                    <div key={d.id} onClick={() => set("tipo_dosador", d.id)} style={{
                                        border:`2px solid ${params.tipo_dosador===d.id?"var(--primary)":"var(--border2)"}`,
                                        borderRadius:10, padding:"20px 12px", cursor:"pointer",
                                        background: params.tipo_dosador===d.id ? "var(--primary-soft)" : "var(--bg0)",
                                        textAlign:"center", transition:"all .15s",
                                    }}>
                                        <div style={{ fontSize:36, marginBottom:10, opacity:params.tipo_dosador===d.id?1:.3 }}>{d.icon}</div>
                                        <div style={{ fontWeight:700, fontSize:13,
                                            color:params.tipo_dosador===d.id?"var(--primary)":"var(--text2)" }}>{d.label}</div>
                                        {params.tipo_dosador===d.id && (
                                            <div style={{ marginTop:8, fontFamily:"var(--font-mono)", fontSize:9, color:"var(--primary)" }}>● ATIVO</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div style={{ padding:"0 16px 12px", fontFamily:"var(--font-mono)", fontSize:10, color:"var(--text3)" }}>
                                Pr_Tipo_Dosador = {params.tipo_dosador} → SUBS_PAYLOADS[17]
                            </div>
                        </Section>
                    )}
                    {selTab === "datador" && (
                        <Section title="Datador" icon="⊕" accent="var(--info)">
                            <ParamRow label="Datador" sub="Sel_Datador · SUBS[15]">
                                <Toggle value={params.sel_datador} onChange={v=>set("sel_datador",v)} />
                            </ParamRow>
                            <ParamRow label="Temperatura do Datador via CLP (Q15)" sub="SEL_TEMP_DATADOR_CLP · SUBS[16]">
                                <Toggle value={params.sel_temp_datador} onChange={v=>set("sel_temp_datador",v)} />
                            </ParamRow>
                        </Section>
                    )}
                </>)}

                {/* ════ MOTORES ════ */}
                {tab === "motores" && (
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                        <Section title="Motor Mesa (Tracionador)" icon="◎" accent="var(--primary)">
                            <ParamRow label="Velocidade do Motor" sub="Pr_RPM_Motor_Tracionador">
                                <NumField value={params.vel_motor_rpm} onChange={v=>set("vel_motor_rpm",v)} min={0} max={3600} step={10} unit=" RPM" />
                            </ParamRow>
                            <ParamRow label="Relação de Redução 1:" sub="Pr_Redutor_Motor_Tracionador">
                                <NumField value={params.relacao_reducao} onChange={v=>set("relacao_reducao",v)} min={1} max={200} step={0.05} />
                            </ParamRow>
                            <ParamRow label="Velocidade Alvo" destaque>
                                <NumField value={params.pacotes_min} onChange={v=>set("pacotes_min",v)} min={1} max={120} step={0.5} unit=" pct/min" />
                            </ParamRow>
                            <div style={{ padding:20, textAlign:"center", borderTop:"1px solid var(--border)" }}>
                                <div style={{ fontFamily:"var(--font-mono)", fontSize:10, color:"var(--text3)", letterSpacing:2, marginBottom:6 }}>FREQUÊNCIA CALCULADA</div>
                                <div style={{ fontFamily:"var(--font-display)", fontSize:48, fontWeight:800, color:"var(--primary)", lineHeight:1 }}>{freqHz}</div>
                                <div style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--text3)", marginTop:4 }}>Hz</div>
                                <div style={{ fontFamily:"var(--font-mono)", fontSize:9, color:"var(--text3)", marginTop:6 }}>
                                    = {params.pacotes_min} × {params.relacao_reducao} / {params.vel_motor_rpm} × 60
                                </div>
                            </div>
                        </Section>

                        <Section title="Temperatura de Solda" icon="🌡" accent="var(--orange)">
                            <ParamRow label="Temperatura Horizontal" sub="Pr_Perc_Solda_Horizontal · SUBS[4]" destaque>
                                <NumField value={params.temp_horizontal} onChange={v=>set("temp_horizontal",v)} min={0} max={100} step={1} unit="%" />
                            </ParamRow>
                            <ParamRow label="Temperatura Vertical" sub="Pr_Perc_Solda_Vertical · SUBS[5]">
                                <NumField value={params.temp_vertical} onChange={v=>set("temp_vertical",v)} min={0} max={100} step={1} unit="%" />
                            </ParamRow>
                            <div style={{ padding:"20px 16px", display:"flex", flexDirection:"column", gap:14 }}>
                                {[["Horizontal",params.temp_horizontal,"var(--primary)"],["Vertical",params.temp_vertical,"var(--orange)"]].map(([l,v,c])=>(
                                    <div key={l}>
                                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                                            <span style={{ fontSize:13, fontWeight:500, color:"var(--text)" }}>{l}</span>
                                            <span style={{ fontFamily:"var(--font-mono)", fontSize:16, fontWeight:700, color:c }}>{v}%</span>
                                        </div>
                                        <div style={{ height:10, background:"var(--bg3)", borderRadius:99, overflow:"hidden" }}>
                                            <div style={{ width:`${v}%`, height:"100%", background:c, borderRadius:99, transition:"width .3s" }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    </div>
                )}

                {/* Rodapé MQTT */}
                <div style={{ padding:"10px 16px", background:"var(--bg1)", border:"1px solid var(--border)",
                    borderRadius:8, fontFamily:"var(--font-mono)", fontSize:10, color:"var(--text3)",
                    display:"flex", gap:24, flexWrap:"wrap" }}>
                    <span>📡 <span style={{color:"var(--text)"}}>191.252.217.250:1883</span></span>
                    <span>📥 PUB: <span style={{color:"var(--green)"}}>XP340/*</span></span>
                    <span>📤 SUB: <span style={{color:"var(--orange)"}}>SUBS_PAYLOADS[4..20]</span></span>
                    <span>💾 Banco: <span style={{color:"var(--green)"}}>parametros_maquina</span></span>
                    <span>⏳ Write CLP: <span style={{color:"var(--orange)"}}>aguardando Node-RED</span></span>
                </div>
            </>)}
        </div>
    );
}
