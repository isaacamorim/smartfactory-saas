// src/services/mqttData.js
// Dados reais via FastAPI → InfluxDB
// Para voltar ao mock: troque "return request(...)" por "return MOCK_..."

const BASE_URL = "http://191.252.217.250:8000";

function authHeaders() {
    const token = localStorage.getItem("sf_token");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function request(path) {
    const res = await fetch(`${BASE_URL}${path}`, { headers: authHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

// ─── DADOS REAIS ──────────────────────────────────────────────────────────────

export async function getAll(serial) {
    // Uma única chamada busca todos os tópicos — mais eficiente
    return request(`/metrics/${encodeURIComponent(serial)}/all`);
}

export async function getStatus(serial) {
    return request(`/metrics/${encodeURIComponent(serial)}/status`);
}

export async function getPesos(serial) {
    return request(`/metrics/${encodeURIComponent(serial)}/pesos`);
}

export async function getTurno(serial) {
    return request(`/metrics/${encodeURIComponent(serial)}/turno`);
}

export async function getSemana(serial) {
    return request(`/metrics/${serial}/semana`);
}

export async function getConfig(serial) {
    return request(`/metrics/${serial}/config`);
}

export async function getKPIs(serial) {
    return request(`/metrics/${serial}/kpis`);
}

export async function getHeartbeat(serial) {
    return request(`/metrics/${encodeURIComponent(serial)}/heartbeat`);
}

// ─── HEALTH CHECK — usado pelo status bar ─────────────────────────────────────
export async function checkHealth() {
    try {
        const [influx, api] = await Promise.all([
            fetch(`${BASE_URL}/metrics/health`, { headers: authHeaders() })
                .then(r => r.ok ? r.json() : { status: "error" })
                .catch(() => ({ status: "error" })),
            fetch(`${BASE_URL}/`, { headers: authHeaders() })
                .then(r => r.ok ? { status: "ok" } : { status: "error" })
                .catch(() => ({ status: "error" })),
        ]);

        // MQTT: considera online se dados de status chegaram nos últimos 30s
        // Por agora usa influx como proxy (se influx ok, mqtt provavelmente ok)
        return {
            api: api.status === "ok",
            influx: influx.status === "ok",
            mqtt: influx.status === "ok", // mesmo proxy até ter endpoint dedicado
        };
    } catch {
        return { api: false, influx: false, mqtt: false };
    }
}

// ─── OEE calculado no frontend ────────────────────────────────────────────────
export function calcularOEE(
    status,
    kpis,
    meta_pac_min = 45
) {

    const performance =
        Math.min(
            (
                (status.vel ?? 0)
                /
                meta_pac_min
            )
            *
            100,
            100
        );

    const disponibilidade =
        status.ciclo === 1
            ?
            100
            :
            0;

    const qualidade = 100;

    const oee =
        (
            disponibilidade
            *
            performance
            *
            qualidade
        )
        /
        10000;

    return {

        oee: +oee.toFixed(1),

        disponibilidade,

        performance:
            +performance.toFixed(1),

        qualidade

    }

}