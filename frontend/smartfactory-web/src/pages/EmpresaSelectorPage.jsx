// src/pages/EmpresaSelectorPage.jsx
// Mostrado para admin ao entrar no dashboard — escolhe a empresa
import { useEffect, useState } from "react";
import { PageHeader } from "../components/UI";
import { empresasAPI } from "../services/api";

export default function EmpresaSelectorPage({ navigate }) {
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        empresasAPI.listar()
            .then(setEmpresas)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div style={{ padding: 40, textAlign: "center", fontFamily: "var(--font-mono)", color: "var(--text3)" }}>
            Carregando empresas...
        </div>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <PageHeader title="Selecionar Empresa" sub="ADMIN · VISÃO GLOBAL" />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
                {empresas.map(emp => (
                    <div
                        key={emp.id}
                        className="sf-card"
                        onClick={() => navigate("empresa_dashboard", { empresa_id: emp.id })}
                        style={{ cursor: "pointer", padding: 24, transition: "box-shadow .15s, transform .15s" }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(213,32,41,.15)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = ""; e.currentTarget.style.transform = ""; }}
                    >
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 14 }}>
                            🏭
                        </div>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{emp.nome}</div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text3)" }}>{emp.cnpj}</div>
                        <div style={{ marginTop: 14, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--primary)" }}>Abrir dashboard →</div>
                    </div>
                ))}
            </div>
        </div>
    );
}