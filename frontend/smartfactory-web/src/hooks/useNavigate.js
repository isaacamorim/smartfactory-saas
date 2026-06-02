// src/hooks/useNavigate.js
// ─── Navegação hierárquica sem React Router ───────────────────────────────────
// Substitui o useState("dashboard") do App.jsx.
// Suporta params (empresa_id, linha_id, maquina_id) e histórico back().

import { useState, useCallback } from "react";

const INITIAL = { id: "dashboard", params: {} };

export default function useNavigate(initialPage = "dashboard") {
    const [stack, setStack] = useState([{ id: initialPage, params: {} }]);

    const current = stack[stack.length - 1];

    // Navega para nova página (empilha)
    const navigate = useCallback((pageId, params = {}) => {
        setStack(s => [...s, { id: pageId, params }]);
    }, []);

    // Volta para página anterior (desempilha)
    const back = useCallback(() => {
        setStack(s => (s.length > 1 ? s.slice(0, -1) : s));
    }, []);

    // Vai direto para página sem histórico (ex: clique na Sidebar)
    const goTo = useCallback((pageId, params = {}) => {
        setStack([{ id: pageId, params }]);
    }, []);

    const canGoBack = stack.length > 1;

    return {
        page: current.id,
        params: current.params,
        navigate,
        back,
        goTo,
        canGoBack,
    };
}