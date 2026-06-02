// src/App.jsx
// ─── 3 mudanças em relação ao original ───────────────────────────────────────
// 1. import useNavigate + 3 novas páginas
// 2. useNavigate() substitui useState("dashboard")
// 3. buildPages() inclui as 3 novas páginas com params
// Sidebar continua chamando goTo() — interface idêntica ao setPage() antigo.

import "./styles/globals.css";
import { useAuth } from "./hooks/useAuth";
import useNavigate from "./hooks/useNavigate";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";

// Páginas existentes
import MaquinasPage from "./pages/MaquinasPage";
import LinhasPage from "./pages/LinhasPage";
import AlarmesPage from "./pages/AlarmesPage";
import ManutencaoPage from "./pages/ManutencaoPage";
import EmpresasPage from "./pages/EmpresasPage";
import UsuariosPage from "./pages/UsuariosPage";
import MetasPage from "./pages/MetasPage";
import ParametrosPage from "./pages/ParametrosPage";

// Novas páginas hierárquicas
import EmpresaDashboardPage from "./pages/EmpresaDashboardPage";
import LinhaDashboardPage from "./pages/LinhaDashboardPage";
import MaquinaDashboardPage from "./pages/MaquinaDashboardPage";

// ─── TICKER ───────────────────────────────────────────────────────────────────

function Ticker() {
  const items = [
    { text: "POSTGRESQL ONLINE", color: "var(--green)" },
    { text: "INFLUXDB ONLINE", color: "var(--green)" },
    { text: "SMART FACTORY SaaS", color: "var(--text3)" },
    { text: "INDÚSTRIA 4.0", color: "var(--text3)" },
  ];

  return (
    <div style={{
      background: "var(--bg1)",
      borderBottom: "1px solid var(--border)",
      padding: "4px 0",
      overflow: "hidden",
      whiteSpace: "nowrap"
    }}>
      <div style={{
        display: "inline-block",
        animation: "ticker-scroll 26s linear infinite"
      }}>
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              letterSpacing: 1.5,
              color: item.color,
              marginRight: 48
            }}
          >
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  const auth = useAuth();

  // useNavigate substitui useState("dashboard")
  // goTo() = interface idêntica ao setPage() antigo para a Sidebar
  const {
    page,
    params,
    navigate,
    back,
    goTo,
    canGoBack
  } = useNavigate(
    "empresa_dashboard",
    { empresa_id: 7 }
  );

  const handleLogout = () => auth.logout();

  if (!auth.isLogado) {
    return (
      <LoginPage
        onLogin={() =>
          navigate(
            "empresa_dashboard",
            { empresa_id: auth.usuario?.empresa_id || 7 }
          )
        }
        auth={auth}
      />
    );
  }

  // empresa_id do usuário logado (null para admin)
  const empresa_id = auth.usuario?.empresa_id;

  // Navegar para dashboard de empresa:
  // gerente/operador → empresa própria direto
  // admin → precisa escolher (aqui manda para empresa 1 como fallback — ajuste conforme necessário)
  const irParaEmpresa = (id) => navigate("empresa_dashboard", { empresa_id: id });

  const buildPages = () => ({

    alarmes: <AlarmesPage auth={auth} />,
    manutencao: <ManutencaoPage auth={auth} />,

    empresas: <EmpresasPage auth={auth} />,
    linhas: <LinhasPage auth={auth} />,      // <<< ADICIONA
    maquinas: <MaquinasPage auth={auth} />,
    usuarios: <UsuariosPage auth={auth} />,
    metas: <MetasPage auth={auth} />,
    parametros: <ParametrosPage auth={auth} />,

    // ── Novas páginas hierárquicas ────────────────────────────────────────
    empresa_dashboard: (
      <EmpresaDashboardPage
        empresa_id={
          params.empresa_id ??
          auth.usuario?.empresa_id ??
          6 // fallback admin
        }

        navigate={navigate}
        back={back}
        canGoBack={canGoBack}
      />
    ),

    linha_dashboard: (
      <LinhaDashboardPage
        empresa_id={params.empresa_id ?? empresa_id}
        linha_id={params.linha_id}
        navigate={navigate}
        back={back}
        canGoBack={canGoBack}
      />
    ),

    maquina_dashboard: (
      <MaquinaDashboardPage
        serial={params.serial}
        back={back}
        canGoBack={canGoBack}
      />
    ),

  });

  const pages = buildPages();

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "var(--bg0)" }}>
      <div className="grid-bg" />
      <div style={{ display: "flex", height: "100vh", position: "relative", zIndex: 1 }}>

        {/* Sidebar recebe goTo — interface idêntica ao setPage antigo */}
        <Sidebar page={page} setPage={goTo} usuario={auth.usuario} />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Navbar page={page} usuario={auth.usuario} onLogout={handleLogout} />
          <Ticker />
          <main key={page} style={{ flex: 1, overflowY: "auto", padding: 24 }} className="animate-up">
            {pages[page] ?? (
              <div style={{ color: "var(--text3)", fontFamily: "var(--font-mono)", padding: 20 }}>
                Página "{page}" não encontrada.
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}