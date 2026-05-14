// src/hooks/useMachineRealtime.js

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
    getAll,
    calcularOEE
} from "../services/mqttData";

// ─────────────────────────────────────────────
// CONFIG PADRÃO
// ─────────────────────────────────────────────

const DEFAULT_REFRESH = 5000; // 5s
const STALE_TIMEOUT = 15000;  // 15s

const META_PAC_MIN = 45;

// ─────────────────────────────────────────────
// HOOK REALTIME INDUSTRIAL
// ─────────────────────────────────────────────

export default function useMachineRealtime(
    serial,
    options = {}
) {

    const refreshMs = options.refreshMs || DEFAULT_REFRESH;

    // ─────────────────────────────────────────
    // STATES
    // ─────────────────────────────────────────

    const [loading, setLoading] = useState(true);

    const [status, setStatus] = useState({});
    const [pesos, setPesos] = useState({});
    const [turno, setTurno] = useState({});
    const [kpis, setKpis] = useState({});
    const [config, setConfig] = useState({});
    const [heartbeat, setHeartbeat] = useState({});

    const [error, setError] = useState(null);

    const [lastUpdate, setLastUpdate] = useState(null);

    // ─────────────────────────────────────────
    // REFS
    // ─────────────────────────────────────────

    const mountedRef = useRef(true);
    const intervalRef = useRef(null);

    // ─────────────────────────────────────────
    // ONLINE / STALE
    // ─────────────────────────────────────────

    const online = heartbeat?.alive === 1;

    const stale = useMemo(() => {

        if (!lastUpdate) return true;

        return (Date.now() - lastUpdate) > STALE_TIMEOUT;

    }, [lastUpdate]);

    // ─────────────────────────────────────────
    // OEE
    // ─────────────────────────────────────────

    const oee = useMemo(() => {

        return calcularOEE(
            status,
            kpis,
            META_PAC_MIN
        );

    }, [status, kpis]);

    // ─────────────────────────────────────────
    // LOAD
    // ─────────────────────────────────────────

    const load = useCallback(async () => {

        try {

            const data = await getAll(serial);

            if (!mountedRef.current) return;

            setStatus(data.status || {});
            setPesos(data.pesos || {});
            setTurno(data.turno || {});
            setKpis(data.kpis || {});
            setConfig(data.config || {});
            setHeartbeat(data.heartbeat || {});

            setLastUpdate(Date.now());

            setError(null);

        } catch (err) {

            console.error("Realtime load error:", err);

            if (!mountedRef.current) return;

            setError(err);

        } finally {

            if (mountedRef.current) {
                setLoading(false);
            }

        }

    }, [serial]);

    // ─────────────────────────────────────────
    // START POLLING
    // ─────────────────────────────────────────

    useEffect(() => {

        mountedRef.current = true;

        load();

        intervalRef.current = setInterval(() => {
            load();
        }, refreshMs);

        return () => {

            mountedRef.current = false;

            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }

        };

    }, [load, refreshMs]);

    // ─────────────────────────────────────────
    // REFRESH MANUAL
    // ─────────────────────────────────────────

    const refresh = useCallback(() => {
        load();
    }, [load]);

    // ─────────────────────────────────────────
    // STATUS OPERACIONAL
    // ─────────────────────────────────────────

    const machineState = useMemo(() => {

        if (!online) {
            return "OFFLINE";
        }

        if (stale) {
            return "STALE";
        }

        if (status.auto === 1) {
            return "RUNNING";
        }

        if (status.manual === 1) {
            return "MANUAL";
        }

        return "IDLE";

    }, [online, stale, status]);

    // ─────────────────────────────────────────
    // RETURN
    // ─────────────────────────────────────────

    return {

        loading,
        error,

        online,
        stale,

        machineState,

        heartbeat,

        status,
        pesos,
        turno,
        kpis,
        config,

        oee,

        lastUpdate,

        refresh,

    };

}