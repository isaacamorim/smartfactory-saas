// src/services/api.js
const BASE_URL = "http://191.252.217.250:8000";

// ─── TOKEN ────────────────────────────────────
export const getToken   = ()    => localStorage.getItem("sf_token");
export const setToken   = (tok) => localStorage.setItem("sf_token", tok);
export const clearToken = ()    => localStorage.removeItem("sf_token");

function authHeaders() {
    const token = getToken();
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function request(method, path, body = null) {
    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: authHeaders(),
        body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 204) return null;
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || `Erro ${res.status}`);
    return data;
}

// ─── AUTH ─────────────────────────────────────
export const authAPI = {
    login:    (email, senha) => request("POST", "/auth/login",    { email, senha }),
    registro: (data)         => request("POST", "/auth/registro", data),
};

// ─── EMPRESAS ─────────────────────────────────
export const empresasAPI = {
    listar:         ()              => request("GET",    "/empresas/"),
    obter:          (id)            => request("GET",    `/empresas/${id}`),
    obterCompleto:  (id)            => request("GET",    `/empresas/${id}/completo`),
    criar:          (data)          => request("POST",   "/empresas/", data),
    atualizar:      (id, data)      => request("PUT",    `/empresas/${id}`, data),
    deletar:        (id)            => request("DELETE", `/empresas/${id}`),
};

// ─── LINHAS ───────────────────────────────────
export const linhasAPI = {
    listar:   (empresaId)         => request("GET",    `/empresas/${empresaId}/linhas`),
    criar:    (empresaId, data)   => request("POST",   `/empresas/${empresaId}/linhas`, data),
    atualizar:(empresaId, id, data) => request("PUT",  `/empresas/${empresaId}/linhas/${id}`, data),
    deletar:  (empresaId, id)     => request("DELETE", `/empresas/${empresaId}/linhas/${id}`),
    listarMaquinas: (empresaId, linhaId) =>
        request("GET", `/empresas/${empresaId}/linhas/${linhaId}/maquinas`),
};

// ─── MÁQUINAS ─────────────────────────────────
export const maquinasAPI = {
    listarPorEmpresa: (empresaId) => request("GET",    `/maquinas/empresa/${empresaId}`),
    obterPorSerial:   (serial)    => request("GET",    `/maquinas/serial/${serial}`),
    obter:            (id)        => request("GET",    `/maquinas/${id}`),
    criar:            (data)      => request("POST",   "/maquinas/", data),
    atualizar:        (id, data)  => request("PUT",    `/maquinas/${id}`, data),
    deletar:          (id)        => request("DELETE", `/maquinas/${id}`),
};

// ─── METAS OEE ────────────────────────────────
export const metasAPI = {
    obter:  (maquinaId) => request("GET",  `/maquinas/${maquinaId}/meta`),
    salvar: (data)      => request("POST", "/maquinas/meta", data),
};

// ─── USUÁRIOS ─────────────────────────────────
export const usuariosAPI = {
    listar:    (empresaId) => request("GET",    `/usuarios/empresa/${empresaId}`),
    criar:     (data)      => request("POST",   "/usuarios/", data),
    atualizar: (id, data)  => request("PUT",    `/usuarios/${id}`, data),
    deletar:   (id)        => request("DELETE", `/usuarios/${id}`),
};

// ─── MÉTRICAS ─────────────────────────────────
export const metricsAPI = {
    atual:     (serial, janela = "-1h")         => request("GET", `/metrics/${serial}/atual?janela=${janela}`),
    oee:       (serial, janela = "-8h")          => request("GET", `/metrics/${serial}/oee?janela=${janela}`),
    historico: (serial, field, janela = "-24h")  => request("GET", `/metrics/${serial}/historico/${field}?janela=${janela}`),
};
