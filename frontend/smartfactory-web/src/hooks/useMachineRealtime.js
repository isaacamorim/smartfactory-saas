// src/hooks/useMachineRealtime.js
// ─── Hook realtime de máquina ─────────────────────────────────────────────────
// Polling da API REST. Substitui a versão que usava mqttData/getAll.
// Interface de retorno idêntica à versão anterior para não quebrar páginas.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getMachineAll } from "../services/metricsData";

const DEFAULT_REFRESH = 10_000; // 10s
const STALE_TIMEOUT = 30_000; // 30s — mais tolerante que o antigo (15s)

export default function useMachineRealtime(machine, options = {}) {
    const refreshMs = options.refreshMs ?? DEFAULT_REFRESH;

    // ── Estado ────────────────────────────────────────────────────────────────

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);

    // ── Refs ──────────────────────────────────────────────────────────────────

    const mountedRef = useRef(true);
    const intervalRef = useRef(null);
    const fetchingRef = useRef(false); // evita fetch duplo

    // ── Fetch ─────────────────────────────────────────────────────────────────

    const load = useCallback(async () => {
        if (fetchingRef.current) return;
        fetchingRef.current = true;

        try {
            const result = await getMachineAll(machine);
            if (!mountedRef.current) return;
            setData(result);
            setLastUpdate(Date.now());
            setError(null);
        } catch (err) {
            console.error("[useMachineRealtime] erro:", err);
            if (mountedRef.current) setError(err);
        } finally {
            fetchingRef.current = false;
            if (mountedRef.current) setLoading(false);
        }
    }, [machine]);

    // ── Polling ───────────────────────────────────────────────────────────────

    useEffect(() => {
        mountedRef.current = true;
        load();
        intervalRef.current = setInterval(load, refreshMs);
        return () => {
            mountedRef.current = false;
            clearInterval(intervalRef.current);
        };
    }, [load, refreshMs]);

    // ── Derivados ─────────────────────────────────────────────────────────────

    const online = data?.online ?? false;

    const stale = useMemo(() => {
        if (!lastUpdate) return true;
        return Date.now() - lastUpdate > STALE_TIMEOUT;
    }, [lastUpdate]);

    const machineState = useMemo(() => {
        if (!online) return "OFFLINE";
        if (stale) return "STALE";
        if (data?.ciclo === 1) return "RUNNING";
        if (data?.auto === 1) return "RUNNING";
        if (data?.manual === 1) return "MANUAL";
        return "IDLE";
    }, [online, stale, data]);

    // OEE como objeto (compatível com o que DashboardPage espera)
    const oee = useMemo(() => ({
        oee: data?.oee ?? 0,
        disponibilidade: data?.disponibilidade ?? 0,
        performance: data?.performance ?? 0,
        qualidade: data?.qualidade ?? 0,
    }), [data]);

    // Compatibilidade com estrutura antiga do hook
    // (DashboardPage usava status.vel, kpis.ok, turno.t1, etc.)
    const status = useMemo(() => ({
        vel: data?.vel ?? 0,
        pac_min: data?.pac_min ?? 0,
        prod_turno: data?.prod_turno ?? 0,
        total: data?.total ?? 0,
        turno: data?.turno ?? 0,
        auto: data?.auto ?? 0,
        manual: data?.manual ?? 0,
        ciclo: data?.ciclo ?? 0,
    }), [data]);

    const kpis = useMemo(() => ({
        ok: data?.ok ?? 0,
        nok: data?.nok ?? 0,
        ult_peso: data?.ult_peso ?? 0,
        prod_turno: data?.prod_turno ?? 0,
        peso_ok_total: data?.peso_ok_total ?? 0,
        peso_nok_total: data?.peso_nok_total ?? 0,
    }), [data]);

    const turno = useMemo(() => ({
        t1: data?.t1 ?? 0,
        t2: data?.t2 ?? 0,
        t3: data?.t3 ?? 0,
        atual: data?.turno ?? 0,
    }), [data]);

    const pesos = useMemo(() => ({
        liq: data?.liq ?? 0,
        liq_scaime: data?.liq_scaime ?? 0,
        bruto: data?.bruto ?? 0,
        estavel: data?.estavel === 1,
        min: data?.min ?? 0,
        max: data?.max ?? 0,
        media: data?.media ?? 0,
    }), [data]);

    const config = useMemo(() => ({
        peso_ref: data?.peso_ref ?? 0,
        tol_min: data?.tol_min ?? 0,
        tol_max: data?.tol_max ?? 0,
    }), [data]);

    const heartbeat = useMemo(() => ({
        alive: data?.alive ?? 0,
        hb: data?.hb ?? 0,
        online: data?.online ?? false,
    }), [data]);

    const forecast = useMemo(() => ({
        media_hora: data?.media_hora ?? 0,
        previsao_turno: data?.previsao_turno ?? 0,
    }), [data]);

    // ── Refresh manual ────────────────────────────────────────────────────────

    const refresh = useCallback(() => load(), [load]);

    // ── Return ────────────────────────────────────────────────────────────────

    return {
        // estado
        loading,
        error,
        lastUpdate,

        // conexão
        online,
        stale,
        machineState,

        // dados flat (novos — use esses no DashboardPage)
        data,

        // dados estruturados (compatibilidade com páginas antigas)
        status,
        kpis,
        turno,
        pesos,
        config,
        heartbeat,
        oee,
        forecast,

        // ação
        refresh,
    };
}