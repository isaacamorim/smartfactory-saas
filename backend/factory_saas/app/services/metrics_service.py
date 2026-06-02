## nano app/services/metrics_service.py

from datetime import datetime, timezone
from app.influx import get_influx_client, INFLUX_BUCKET
from app.database import SessionLocal
from app.models import Maquina


def query_machines():

    db = SessionLocal()

    maquinas_validas = set(
        row.serial_number
        for row in db.query(Maquina).filter(Maquina.deleted_at == None).all()
    )

    db.close()

    flux = f"""
    from(bucket:"{INFLUX_BUCKET}")
      |> range(start:-30d)
      |> filter(fn:(r)=>
            r["_measurement"]=="machine_metrics"
        )
      |> filter(fn:(r)=> exists r.machine)
      |> distinct(column:"machine")
    """

    machines = []

    client = get_influx_client()

    try:

        tables = client.query_api().query(flux)

        for table in tables:

            for row in table.records:

                serial = row.values.get("machine")

                if serial in maquinas_validas:

                    machines.append(serial)

    finally:

        client.close()

    return sorted(set(machines))


def machine_summary(machine: str):

    flux = f"""
    from(bucket: "{INFLUX_BUCKET}")
      |> range(start: -24h)
      |> filter(fn:(r) => r["_measurement"] == "machine_metrics")
      |> filter(fn:(r) => r["machine"] == "{machine}")
      |> group(columns: ["_field"])
      |> last()
    """

    data = {}
    last_seen = None

    client = get_influx_client()

    try:
        tables = client.query_api().query(flux)

        for table in tables:
            for row in table.records:

                campo = row.get_field()
                valor = row.get_value()

                data[campo] = valor

                if last_seen is None or row.get_time() > last_seen:
                    last_seen = row.get_time()

    finally:
        client.close()

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


def build_overview() -> list:
    result = []
    for machine in query_machines():
        s  = machine_summary(machine)
        st = s["status"]
        result.append({
            "machine":    machine,
            "online":     s["online"],
            "last_seen":  s["last_seen"],
            "vel":        st.get("vel"),
            "prod_turno": st.get("prod_turno") or st.get("contador_boas"),
            "turno":      st.get("turno"),
            "total":      st.get("total") or st.get("contador_total"),
        })
    return result


def build_dashboard() -> dict:
    dados  = build_overview()
    online = [m for m in dados if m["online"]]
    return {
        "machines_total":   len(dados),
        "machines_online":  len(online),
        "machines_offline": len(dados) - len(online),
        "prod_turno_total": sum((m["prod_turno"] or 0) for m in online),
        "total_pecas":      sum((m["total"]      or 0) for m in online),
        "vel_media":        round(sum((m["vel"] or 0) for m in online) / max(len(online), 1), 2),
        "turnos": {
            "t1": sum(1 for m in online if m["turno"] == 1),
            "t2": sum(1 for m in online if m["turno"] == 2),
            "t3": sum(1 for m in online if m["turno"] == 3),
        },
        "offline": [m["machine"] for m in dados if not m["online"]],
    }


def build_ranking() -> list:
    resultado = []
    for machine in query_machines():
        s  = machine_summary(machine)
        st = s.get("status", {})
        resultado.append({
            "machine":    machine,
            "online":     s["online"],
            "prod_turno": st.get("prod_turno") or st.get("contador_boas") or 0,
            "total":      st.get("total") or st.get("contador_total") or 0,
            "vel":        st.get("vel", 0),
        })
    return sorted(resultado, key=lambda x: x["prod_turno"] or 0, reverse=True)


# ─── COLE NO FINAL DE app/services/metrics_service.py ────────────────────────
# Depende das funções que já existem no topo do arquivo:
#   machine_summary(), calc_oee() (via oee_service), calc_forecast() (via oee_service)
# Não alterar nada acima.

from app.services.oee_service import calc_oee, calc_forecast

# ─── HELPER: estado industrial correto ────────────────────────────────────────


def _estado_maquina(online: bool, st: dict) -> str:
    """
    Hierarquia de estados (do menos para o mais prioritário):
      OFFLINE  → sem dados > 5 min
      MANUAL   → manual=1
      PRONTA   → auto=1 (modo automático, mas não produzindo)
      PRODUZINDO → ciclo=1 (efetivamente produzindo)
    """
    if not online:
        return "OFFLINE"
    if st.get("ciclo") == 1:
        return "PRODUZINDO"
    if st.get("auto") == 1:
        return "PRONTA"
    if st.get("manual") == 1:
        return "MANUAL"
    return "OFFLINE"


# ─── RESUMO DE UMA MÁQUINA (para cards e listas) ──────────────────────────────


def build_maquina_resumo(serial: str) -> dict:
    """
    Agrega summary + OEE + forecast de uma máquina em um dict flat.
    Usado por build_linha_dashboard() e build_empresa_dashboard().
    """
    s = machine_summary(serial)
    st = s.get("status", {})
    oee = calc_oee(serial)
    fc = calc_forecast(serial)

    online = s.get("online", False)
    estado = _estado_maquina(online, st)

    return {
        "serial": serial,
        "online": online,
        "estado": estado,
        # produção
        "vel": float(st.get("vel", 0) or 0),
        "pac_min": float(st.get("pac_min", 0) or 0),
        "prod_turno": float(st.get("prod_turno", 0) or 0),
        "total": float(st.get("total", 0) or 0),
        "turno_atual": int(st.get("turno", 0) or 0),
        "t1": float(st.get("t1", 0) or 0),
        "t2": float(st.get("t2", 0) or 0),
        "t3": float(st.get("t3", 0) or 0),
        # qualidade
        "ok": float(st.get("ok", 0) or 0),
        "nok": float(st.get("nok", 0) or 0),
        # OEE
        "oee": float(oee.get("oee", 0)),
        "disponibilidade": float(oee.get("disponibilidade", 0)),
        "performance": float(oee.get("performance", 0)),
        "qualidade": float(oee.get("qualidade", 0)),
        # pesagem
        "peso_atual": float(st.get("liq_scaime", 0) or 0) / 10,  # → kg
        "peso_medio": float(st.get("media", 0) or 0),
        "peso_min": float(st.get("min", 0) or 0),
        "peso_max": float(st.get("max", 0) or 0),
        "estavel": st.get("estavel") == 1,
        "tol_min": float(st.get("tol_min", 0) or 0),
        "tol_max": float(st.get("tol_max", 0) or 0),
        "peso_ref": float(st.get("peso_ref", 0) or 0),
        # forecast
        "previsao_turno": float(fc.get("previsao_turno", 0)),
        "media_hora": float(fc.get("media_hora", 0)),
    }


# ─── DASHBOARD LINHA ──────────────────────────────────────────────────────────


def build_linha_dashboard(
    linha_id: int, nome: str, empresa_id: int, serials: list
) -> dict:
    """
    Agrega métricas de todas as máquinas de uma linha.
    serials: lista de serial_number vindos do Postgres.
    """
    maquinas = [build_maquina_resumo(s) for s in serials]
    online = [m for m in maquinas if m["online"]]
    offline = [m for m in maquinas if not m["online"]]

    n_online = len(online)

    return {
        "linha_id": linha_id,
        "nome": nome,
        "empresa_id": empresa_id,
        "machines_total": len(maquinas),
        "machines_online": n_online,
        "machines_offline": len(offline),
        "oee_medio": round(sum(m["oee"] for m in online) / max(n_online, 1), 2),
        "producao_total": sum(m["prod_turno"] for m in maquinas),
        "vel_media": round(sum(m["vel"] for m in online) / max(n_online, 1), 2),
        "maquinas": maquinas,
    }


# ─── DASHBOARD EMPRESA ────────────────────────────────────────────────────────


def build_empresa_dashboard(empresa_id: int, nome: str, linhas_data: list) -> dict:
    """
    Agrega métricas de todas as linhas/máquinas da empresa.

    linhas_data: lista de dicts vindos do Postgres:
      [{ "linha_id": int, "nome": str, "serials": [str, ...] }, ...]
    """
    linhas_resumo = []

    for linha in linhas_data:
        resumo = build_linha_dashboard(
            linha_id=linha["linha_id"],
            nome=linha["nome"],
            empresa_id=empresa_id,
            serials=linha["serials"],
        )
        linhas_resumo.append(resumo)

    # Agrega tudo
    todas_maquinas = [m for l in linhas_resumo for m in l["maquinas"]]
    online = [m for m in todas_maquinas if m["online"]]
    n_online = len(online)

    # Turno com mais máquinas ativas
    turno_counts = {1: 0, 2: 0, 3: 0}
    for m in online:
        t = m.get("turno_atual", 0)
        if t in turno_counts:
            turno_counts[t] += 1
    turno_ativo = max(turno_counts, key=turno_counts.get)

    # Alertas rápidos (sem chamar get_alerts() que varre todas as máquinas)
    from app.services.alert_service import get_alerts as _get_alerts_all

    alertas_todos = _get_alerts_all()
    serials_empresa = {m["serial"] for m in todas_maquinas}
    alertas = [a for a in alertas_todos if a.get("machine") in serials_empresa]

    return {
        "empresa_id": empresa_id,
        "nome": nome,
        "machines_total": len(todas_maquinas),
        "machines_online": n_online,
        "machines_offline": len(todas_maquinas) - n_online,
        "oee_medio": round(sum(m["oee"] for m in online) / max(n_online, 1), 2),
        "producao_total": sum(m["prod_turno"] for m in todas_maquinas),
        "vel_media": round(sum(m["vel"] for m in online) / max(n_online, 1), 2),
        "turnos": {
            "t1_total": sum(m["t1"] for m in todas_maquinas),
            "t2_total": sum(m["t2"] for m in todas_maquinas),
            "t3_total": sum(m["t3"] for m in todas_maquinas),
            "turno_ativo": turno_ativo,
        },
        "linhas": linhas_resumo,
        "alertas": alertas,
    }
