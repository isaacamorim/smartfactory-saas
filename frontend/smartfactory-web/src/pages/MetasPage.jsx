// src/pages/MetasPage.jsx
import { useState } from "react";
import Form from "../components/Form";
import { ProgressBar, PageHeader, Feedback, Modal } from "../components/UI";
import { maquinasAPI, metasAPI } from "../services/api";
import { useApi } from "../hooks/useApi";

const EMPRESA_ID = 1;

const WORLD_CLASS = [
  { label:"OEE",             value:85,   color:"var(--primary)" },
  { label:"Disponibilidade", value:90,   color:"var(--info)"    },
  { label:"Performance",     value:95,   color:"var(--green)"   },
  { label:"Qualidade",       value:99.9, color:"var(--yellow)"  },
];

const FIELDS = (maquinaOptions) => [
  { name:"maquina_id",           label:"Máquina", type:"select", options:maquinaOptions, required:true },
  { name:"meta_producao_hora",   label:"Meta Produção / Hora (un)", placeholder:"650",  type:"number" },
  { name:"meta_disponibilidade", label:"Meta Disponibilidade (%)",  placeholder:"85",   type:"number" },
  { name:"meta_performance",     label:"Meta Performance (%)",      placeholder:"85",   type:"number" },
  { name:"meta_qualidade",       label:"Meta Qualidade (%)",        placeholder:"98",   type:"number" },
];

export default function MetasPage() {
  const { data: maquinas } = useApi(() => maquinasAPI.listarPorEmpresa(EMPRESA_ID));
  const [feedback,   setFeedback]   = useState(null);
  const [modalCriar, setModalCriar] = useState(false);
  const [editando,   setEditando]   = useState(null); // { maquina, meta }
  const [metas,      setMetas]      = useState({});   // maquina_id → meta

  const fb = (tipo, msg) => { setFeedback({ tipo, msg }); setTimeout(() => setFeedback(null), 4000); };

  const maquinaOptions = (maquinas ?? []).map(m => ({ value: m.id, label: `${m.serial_number} · ${m.modelo}` }));

  const handleSalvar = async (values) => {
    try {
      const payload = {
        maquina_id:           Number(values.maquina_id),
        meta_producao_hora:   Number(values.meta_producao_hora)   || 0,
        meta_disponibilidade: Number(values.meta_disponibilidade) || 85,
        meta_performance:     Number(values.meta_performance)     || 85,
        meta_qualidade:       Number(values.meta_qualidade)       || 98,
      };
      const saved = await metasAPI.salvar(payload);
      setMetas(m => ({ ...m, [saved.maquina_id]: saved }));
      fb("ok", "Metas salvas com sucesso!");
      setModalCriar(false);
      setEditando(null);
    } catch (e) { fb("erro", e.message); }
  };

  const handleVerMeta = async (maquina) => {
    let meta = metas[maquina.id];
    if (!meta) {
      try { meta = await metasAPI.obter(maquina.id); setMetas(m => ({ ...m, [maquina.id]: meta })); }
      catch { meta = null; }
    }
    setEditando({ maquina, meta });
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <PageHeader
        title="Metas OEE"
        sub="TARGETS POR MÁQUINA"
        action={<button className="btn btn-solid" onClick={() => setModalCriar(true)}>+ Definir Meta</button>}
      />

      <Feedback {...(feedback ?? {})} onClose={() => setFeedback(null)} />

      <div style={{ display:"flex", gap:16 }}>
        {/* Lista de máquinas com metas */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", gap:12 }}>
          {(maquinas ?? []).length === 0 ? (
            <div className="sf-card" style={{ padding:32, textAlign:"center", color:"var(--text3)" }}>
              Nenhuma máquina cadastrada.
            </div>
          ) : (
            (maquinas ?? []).map(m => {
              const meta = metas[m.id];
              return (
                <div key={m.id} className="sf-card" style={{ padding:16 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                    <div>
                      <span className="serial" style={{ marginRight:10 }}>{m.serial_number}</span>
                      <span style={{ fontSize:12, color:"var(--text3)" }}>{m.modelo}</span>
                    </div>
                    <div style={{ display:"flex", gap:6 }}>
                      <button className="btn btn-icon" onClick={() => handleVerMeta(m)} title="Ver / Editar">✎</button>
                    </div>
                  </div>

                  {meta ? (
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
                      {[
                        ["Prod./h",    meta.meta_producao_hora + " un",  "var(--text)"],
                        ["Disp.",      meta.meta_disponibilidade + "%",   "var(--info)"],
                        ["Perf.",      meta.meta_performance + "%",       "var(--green)"],
                        ["Qual.",      meta.meta_qualidade + "%",         "var(--yellow)"],
                      ].map(([l,v,c]) => (
                        <div key={l} style={{ background:"var(--bg1)", border:"1px solid var(--border)", padding:"8px 10px", borderRadius:6 }}>
                          <div style={{ fontSize:10, fontWeight:600, color:"var(--text3)", textTransform:"uppercase", marginBottom:4 }}>{l}</div>
                          <div style={{ fontFamily:"var(--font-display)", fontSize:18, fontWeight:700, color:c }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize:12, color:"var(--text3)", fontStyle:"italic" }}>
                      Meta não definida —{" "}
                      <span style={{ color:"var(--primary)", cursor:"pointer", fontStyle:"normal" }}
                        onClick={() => setModalCriar(true)}>definir agora</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Referência World Class */}
        <div style={{ width:260, flexShrink:0 }}>
          <div className="sf-card">
            <div className="sf-card-header"><span className="sf-card-title">World Class</span></div>
            <div className="sf-card-body" style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {WORLD_CLASS.map(w => <ProgressBar key={w.label} label={w.label} value={w.value} color={w.color} />)}
              <div style={{ marginTop:4, padding:12, background:"var(--bg1)", border:"1px solid var(--border)", borderRadius:6 }}>
                <div style={{ fontSize:10, fontWeight:600, color:"var(--text3)", marginBottom:8, textTransform:"uppercase" }}>Fórmula OEE</div>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--primary)", lineHeight:2 }}>
                  OEE = D × P × Q<br/>
                  <span style={{ color:"var(--text3)" }}>Ex: 90% × 95% × 99.9%</span><br/>
                  <span style={{ color:"var(--green)", fontWeight:600 }}>= 85.4%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Criar */}
      {modalCriar && (
        <Modal title="Definir Meta OEE" onClose={() => setModalCriar(false)} width={560}>
          <Form
            fields={FIELDS(maquinaOptions)}
            onSubmit={handleSalvar}
            onCancel={() => setModalCriar(false)}
            submitLabel="Salvar Metas"
          />
        </Modal>
      )}

      {/* Modal Editar */}
      {editando && (
        <Modal title={`Metas — ${editando.maquina.serial_number}`} onClose={() => setEditando(null)} width={560}>
          <Form
            fields={FIELDS(maquinaOptions)}
            initialValues={{
              maquina_id:           editando.maquina.id,
              meta_producao_hora:   editando.meta?.meta_producao_hora   ?? "",
              meta_disponibilidade: editando.meta?.meta_disponibilidade ?? "85",
              meta_performance:     editando.meta?.meta_performance     ?? "85",
              meta_qualidade:       editando.meta?.meta_qualidade       ?? "98",
            }}
            onSubmit={handleSalvar}
            onCancel={() => setEditando(null)}
            submitLabel="Salvar Metas"
          />
        </Modal>
      )}
    </div>
  );
}
