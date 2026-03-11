// src/App.jsx
import { useState } from "react";
import "./styles/globals.css";
import { useAuth } from "./hooks/useAuth";

import Sidebar    from "./components/Sidebar";
import Navbar     from "./components/Navbar";
import LoginPage  from "./pages/LoginPage";

// Páginas
import DashboardPage  from "./pages/DashboardPage";
import OEEPage        from "./pages/OEEPage";
import MaquinasPage   from "./pages/MaquinasPage";
import LinhasPage     from "./pages/LinhasPage";
import ProducaoPage   from "./pages/ProducaoPage";
import AlarmesPage    from "./pages/AlarmesPage";
import ManutencaoPage from "./pages/ManutencaoPage";
import EmpresasPage   from "./pages/EmpresasPage";
import UsuariosPage   from "./pages/UsuariosPage";
import MetasPage      from "./pages/MetasPage";

function Ticker() {
    const items = [
        { text:"EVA1000-00021 ● ONLINE ● OEE: 75.3%",  color:"var(--green)"  },
        { text:"BOAS: 4.821 un",                        color:"var(--text3)"  },
        { text:"EVA1000-00022 ● PARADA ● OS ABERTA",    color:"var(--orange)" },
        { text:"EVA1000-00023 ● ONLINE ● OEE: 81.2%",  color:"var(--green)"  },
        { text:"SERVIDOR OK · INFLUXDB OK · MQTT OK",   color:"var(--text3)"  },
    ];
    return (
        <div style={{ background:"var(--bg1)", borderBottom:"1px solid var(--border)",
            padding:"4px 0", overflow:"hidden", whiteSpace:"nowrap" }}>
            <div style={{ display:"inline-block", animation:"ticker-scroll 26s linear infinite" }}>
                {[...items,...items].map((item,i) => (
                    <span key={i} style={{ fontFamily:"var(--font-mono)", fontSize:9,
                        letterSpacing:1.5, color:item.color, marginRight:48 }}>{item.text}</span>
                ))}
            </div>
        </div>
    );
}

export default function App() {
    const auth = useAuth();
    const [page, setPage] = useState("dashboard");

    const handleLogin  = () => setPage("dashboard");
    const handleLogout = () => { auth.logout(); };

    // Páginas disponíveis para cada role
    const buildPages = () => ({
        dashboard:  <DashboardPage  auth={auth} />,
        oee:        <OEEPage        auth={auth} />,
        maquinas:   <MaquinasPage   auth={auth} />,
        linhas:     <LinhasPage     auth={auth} />,
        producao:   <ProducaoPage   auth={auth} />,
        alarmes:    <AlarmesPage    auth={auth} />,
        manutencao: <ManutencaoPage auth={auth} />,
        empresas:   <EmpresasPage   auth={auth} />,
        usuarios:   <UsuariosPage   auth={auth} />,
        metas:      <MetasPage      auth={auth} />,
    });

    if (!auth.isLogado) {
        return <LoginPage onLogin={handleLogin} auth={auth} />;
    }

    const pages = buildPages();

    return (
        <div style={{ width:"100vw", height:"100vh", overflow:"hidden", background:"var(--bg0)" }}>
            <div className="grid-bg" />
            <div style={{ display:"flex", height:"100vh", position:"relative", zIndex:1 }}>
                <Sidebar page={page} setPage={setPage} usuario={auth.usuario} />
                <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
                    <Navbar page={page} usuario={auth.usuario} onLogout={handleLogout} />
                    <Ticker />
                    <main key={page} style={{ flex:1, overflowY:"auto", padding:24 }} className="animate-up">
                        {pages[page] ?? (
                            <div style={{ color:"var(--text3)", fontFamily:"var(--font-mono)", padding:20 }}>
                                Página "{page}" não encontrada.
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
