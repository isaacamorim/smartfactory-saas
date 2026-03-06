// src/hooks/useAuth.js
import { useState, useCallback } from "react";
import { authAPI, setToken, clearToken } from "../services/api";

export function useAuth() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const login = useCallback(async (email, senha) => {
    setLoading(true); setError(null);
    try {
      const data = await authAPI.login(email, senha);
      setToken(data.access_token);
      setUser({ email, nome: email.split("@")[0].toUpperCase() });
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  // login rápido com mock (para desenvolvimento sem API)
  const loginMock = useCallback((email) => {
    setUser({ email, nome: email.split("@")[0].toUpperCase() });
  }, []);

  return { user, loading, error, login, logout, loginMock };
}
