// src/services/metricsData.js
// ─── Camada de acesso à API REST de métricas ──────────────────────────────────
// Substitui mqttData.js. Usa os endpoints reais do backend FastAPI.
// Todos os campos vêm flat em summary.status — não há separação por tipo.

import { getToken } from "./api";

const BASE_URL = "http://191.252.217.250:8000";

function authHeaders() {
    const token = getToken();
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function get(path) {
    const res = await fetch(`${BASE_URL}${path}`, { headers: authHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status} em ${path}`);
    return res.json();
}

// ─── ENDPOINTS GLOBAIS ────────────────────────────────────────────────────────

/** KPIs globais: machines_total, machines_online, prod_turno_total, vel_media, offline[] */
export const getDashboard = () => get("/metrics/dashboard");

/** Lista de serials: ["eva1200-01_26", "XP340"] */
export const getMachines = () => get("/metrics/machines");

/** Resumo de todas as máquinas com online/vel/prod_turno */
export const getOverview = () => get("/metrics/overview");

/** Ranking por prod_turno decrescente */
export const getRanking = () => get("/metrics/ranking");

/** Alertas ativos: offline, baixa_vel, sem_producao */
export const getAlerts = () => get("/metrics/alerts");

// ─── ENDPOINTS POR MÁQUINA ───────────────────────────────────────────────────

/**
 * Summary completo de uma máquina.
 * Retorna: { machine, online, last_seen, status: { vel, prod_turno, turno,
 *   t1, t2, t3, total, auto, manual, ciclo, alive, hb, pac_min,
 *   ok, nok, peso_ref, tol_min, tol_max, ult_peso, liq, liq_scaime,
 *   bruto, bruto_scaime, estavel, min, max, media, ... } }
 */
export const getMachineSummary = (machine) => get(`/metrics/${machine}/summary`);

/** OEE: { oee, disponibilidade, performance, qualidade } */
export const getMachineOEE = (machine) => get(`/metrics/${machine}/oee`);

/** Produção por hora: { "2026-05-20 18:00": 676, ... } */
export const getMachineHourly = (machine) => get(`/metrics/${machine}/hourly`);

/** Forecast: { media_hora, previsao_turno } */
export const getMachineForecast = (machine) => get(`/metrics/${machine}/forecast`);

/** Histórico de um campo: [{ time, value }, ...] */
export const getMachineHistorico = (machine, field, janela = "-24h") =>
    get(`/metrics/${machine}/historico/${field}?janela=${janela}`);

/** Paradas detectadas: [{ inicio, fim, duracao_min }, ...] */
export const getMachineStoppages = (machine) => get(`/metrics/${machine}/stoppages`);

// ─── HELPER: TUDO DE UMA MÁQUINA EM PARALELO ─────────────────────────────────
// Mantém a assinatura parecida com o getAll() antigo do mqttData.js
// para facilitar migração do useMachineRealtime.

export async function getMachineAll(machine) {
    const [summary, oee, forecast] = await Promise.allSettled([
        getMachineSummary(machine),
        getMachineOEE(machine),
        getMachineForecast(machine),
    ]);

    const s = summary.status === "fulfilled" ? summary.value : {};
    const o = oee.status === "fulfilled" ? oee.value : {};
    const fc = forecast.status === "fulfilled" ? forecast.value : {};

    // Normaliza: tudo que o dashboard precisa em um objeto flat
    const st = s.status ?? {};

    return {
        // meta
        machine: s.machine ?? machine,
        online: s.online ?? false,
        last_seen: s.last_seen ?? null,

        // produção
        vel: st.vel ?? 0,
        pac_min: st.pac_min ?? 0,
        prod_turno: st.prod_turno ?? 0,
        total: st.total ?? 0,
        turno: st.turno ?? 0,
        t1: st.t1 ?? 0,
        t2: st.t2 ?? 0,
        t3: st.t3 ?? 0,

        // qualidade
        ok: st.ok ?? 0,
        nok: st.nok ?? 0,

        // modo
        auto: st.auto ?? 0,
        manual: st.manual ?? 0,
        ciclo: st.ciclo ?? 0,
        alive: st.alive ?? 0,
        hb: st.hb ?? 0,

        // pesagem
        peso_ref: st.peso_ref ?? 0,
        tol_min: st.tol_min ?? 0,
        tol_max: st.tol_max ?? 0,
        liq: st.liq ?? 0,
        liq_scaime: st.liq_scaime ?? 0,
        bruto: st.bruto ?? 0,
        ult_peso: st.ult_peso ?? 0,
        estavel: st.estavel ?? 0,
        min: st.min ?? 0,
        max: st.max ?? 0,
        media: st.media ?? 0,

        // OEE
        oee: o.oee ?? 0,
        disponibilidade: o.disponibilidade ?? 0,
        performance: o.performance ?? 0,
        qualidade: o.qualidade ?? 0,

        // forecast
        media_hora: fc.media_hora ?? 0,
        previsao_turno: fc.previsao_turno ?? 0,
    };
}