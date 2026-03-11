// src/App.jsx
import { useState } from "react";
import "./styles/globals.css";

import Sidebar    from "./components/Sidebar";
import Navbar     from "./components/Navbar";

import LoginPage      from "./pages/LoginPage";
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

const PAGES = {
  dashboard:  <DashboardPage />,
  oee:        <OEEPage />,
  maquinas:   <MaquinasPage />,
  linhas:     <LinhasPage />,
  producao:   <ProducaoPage />,
  alarmes:    <AlarmesPage />,
  manutencao: <ManutencaoPage />,
  empresas:   <EmpresasPage />,
  usuarios:   <UsuariosPage />,
  metas:      <MetasPage />,
};

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
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);

  const handleLogin  = (u) => { setUser(u); setPage("dashboard"); };
  const handleLogout = ()  => { setUser(null); setPage("login"); };

  return (
    <div style={{ width:"100vw", height:"100vh", overflow:"hidden", background:"var(--bg0)" }}>
      <div className="grid-bg" />

      {page === "login" ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <div style={{ display:"flex", height:"100vh", position:"relative", zIndex:1 }}>
          <Sidebar page={page} setPage={setPage} />
          <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
            <Navbar page={page} user={user} onLogout={handleLogout} />
            <Ticker />
            <main key={page} style={{ flex:1, overflowY:"auto", padding:24 }} className="animate-up">
              {PAGES[page] ?? (
                <div style={{ color:"var(--text3)", fontFamily:"var(--font-mono)", padding:20 }}>
                  Página "{page}" não encontrada.
                </div>
              )}
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
