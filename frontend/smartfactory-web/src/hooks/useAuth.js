// src/hooks/useAuth.js
// Hook de autenticação — persiste usuário no localStorage
import { useState, useCallback } from "react";
import { authAPI, setToken, clearToken, setUsuario, clearUsuario, getToken, getUsuario } from "../services/api";

export function useAuth() {
    const [usuario, setUsuarioState] = useState(() => getUsuario());
    const [loading,  setLoading]  = useState(false);
    const [erro,     setErro]     = useState(null);

    const login = useCallback(async (email, senha) => {
        setLoading(true); setErro(null);
        try {
            const data = await authAPI.login(email, senha);
            setToken(data.access_token);
            setUsuario(data.usuario);
            setUsuarioState(data.usuario);
            return data.usuario;
        } catch (e) {
            setErro(e.message);
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        clearToken();
        clearUsuario();
        setUsuarioState(null);
    }, []);

    return {
        usuario,
        loading,
        erro,
        login,
        logout,
        isLogado:  !!usuario,
        isAdmin:   usuario?.role === "admin",
        isGerente: usuario?.role === "gerente",
        isOperador:usuario?.role === "operador",
        empresaId: usuario?.empresa_id ?? null,
    };
}
