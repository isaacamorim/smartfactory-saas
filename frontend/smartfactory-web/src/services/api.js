// src/services/api.js
// Centraliza todas as chamadas à API FastAPI
// Troca BASE_URL para apontar ao seu servidor

const BASE_URL = "http://191.252.217.250:8000";

// ─── TOKEN HELPERS ────────────────────────────
export const getToken  = ()    => localStorage.getItem("sf_token");
export const setToken  = (tok) => localStorage.setItem("sf_token", tok);
export const clearToken = ()   => localStorage.removeItem("sf_token");

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

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

// ─── AUTH ─────────────────────────────────────
export const authAPI = {
  login:    (email, senha) => request("POST", "/auth/login",    { email, senha }),
  registro: (data)         => request("POST", "/auth/registro", data),
};

// ─── EMPRESAS ─────────────────────────────────
export const empresasAPI = {
  listar:  ()         => request("GET",    "/empresas/"),
  obter:   (id)       => request("GET",    `/empresas/${id}`),
  criar:   (data)     => request("POST",   "/empresas/", data),
  deletar: (id)       => request("DELETE", `/empresas/${id}`),
};

// ─── LINHAS ───────────────────────────────────
export const linhasAPI = {
  listar: (empresaId) => request("GET",  `/empresas/${empresaId}/linhas`),
  criar:  (empresaId, data) => request("POST", `/empresas/${empresaId}/linhas`, data),
};

// ─── MÁQUINAS ─────────────────────────────────
export const maquinasAPI = {
  listarPorEmpresa: (empresaId) => request("GET",    `/maquinas/empresa/${empresaId}`),
  buscarPorSerial:  (serial)    => request("GET",    `/maquinas/serial/${serial}`),
  criar:            (data)      => request("POST",   "/maquinas/", data),
  deletar:          (id)        => request("DELETE", `/maquinas/${id}`),
};

// ─── METAS OEE ────────────────────────────────
export const metasAPI = {
  obter:  (maquinaId) => request("GET",  `/maquinas/${maquinaId}/meta`),
  salvar: (data)      => request("POST", "/maquinas/meta", data),
};

// ─── MÉTRICAS (InfluxDB via API) ──────────────
export const metricsAPI = {
  atual:     (serial, janela = "-1h")  => request("GET", `/metrics/${serial}/atual?janela=${janela}`),
  oee:       (serial, janela = "-8h")  => request("GET", `/metrics/${serial}/oee?janela=${janela}`),
  historico: (serial, field, janela = "-24h") => request("GET", `/metrics/${serial}/historico/${field}?janela=${janela}`),
};
