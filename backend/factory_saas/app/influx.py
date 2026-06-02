# app/services/metrics_service.py
# ─── Resumo e agregação de máquinas ───────────────────────────────────────────

from datetime import datetime, timezone
from app.influx import get_client, INFLUX_BUCKET, query_machines

# ─── SUMMARY ──────────────────────────────────────────────────────────────────


def machine_summary(machine: str) -> dict:
    """
    Retorna status atual de uma máquina + flag online.
    online = True se o último dado tem < 5 min.
    """
    flux = f"""
    from(bucket:"{INFLUX_BUCKET}")
      |> range(start:-24h)
      |> filter(fn:(r) => r["_measurement"] == "machine_metrics")
      |> filter(fn:(r) => r["machine"] == "{machine}")
      |> last()
    """

    data = {}
    last_seen = None

    with get_client() as client:
        tables = client.query_api().query(flux)
        for table in tables:
            for row in table.records:
                data[row.get_field()] = row.get_value()
                last_seen = row.get_time()

    if not data:
        return {"machine": machine, "online": False, "last_seen": None, "status": {}}

    delta = (
        datetime.now(timezone.utc) - last_seen.replace(tzinfo=timezone.utc)
    ).total_seconds()

    return {
        "machine": machine,
        "online": delta < 300,
        "last_seen": last_seen,
        "status": data,
    }


# ─── OVERVIEW ─────────────────────────────────────────────────────────────────


def build_overview() -> list[dict]:
    """Lista resumida de todas as máquinas."""
    machines = query_machines()

    result = []
    for machine in machines:
        s = machine_summary(machine)
        result.append(
            {
                "machine": s["machine"],
                "online": s["online"],
                "last_seen": s["last_seen"],
                "vel": s["status"].get("vel"),
                "prod_turno": s["status"].get("prod_turno"),
                "turno": s["status"].get("turno"),
                "total": s["status"].get("total"),
            }
        )

    return result


# ─── DASHBOARD ────────────────────────────────────────────────────────────────


def build_dashboard() -> dict:
    """Agregado global para tela de dashboard multi-máquina."""
    dados = build_overview()
    online = [m for m in dados if m["online"]]

    return {
        "machines_total": len(dados),
        "machines_online": len(online),
        "machines_offline": len(dados) - len(online),
        "prod_turno_total": sum(m["prod_turno"] or 0 for m in online),
        "total_pecas": sum(m["total"] or 0 for m in online),
        "vel_media": round(sum(m["vel"] or 0 for m in online) / max(len(online), 1), 2),
        "turnos": {
            "t1": sum(1 for m in online if m["turno"] == 1),
            "t2": sum(1 for m in online if m["turno"] == 2),
            "t3": sum(1 for m in online if m["turno"] == 3),
        },
        "offline": [m["machine"] for m in dados if not m["online"]],
    }


# ─── RANKING ──────────────────────────────────────────────────────────────────


def build_ranking() -> list[dict]:
    """Ranking de máquinas por produção do turno."""
    machines = query_machines()

    resultado = []
    for machine in machines:
        s = machine_summary(machine)
        status = s.get("status", {})
        resultado.append(
            {
                "machine": machine,
                "online": s["online"],
                "prod_turno": status.get("prod_turno", 0),
                "total": status.get("total", 0),
                "vel": status.get("vel", 0),
            }
        )

    return sorted(resultado, key=lambda x: x["prod_turno"] or 0, reverse=True)
