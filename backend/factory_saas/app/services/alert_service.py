# app/services/alert_service.py
from app.services.metrics_service import query_machines, machine_summary


def get_alerts() -> list:
    avisos   = []
    machines = query_machines()

    for serial in machines:
        resumo = machine_summary(serial)

        if not resumo["online"]:
            avisos.append({
                "machine":  serial,
                "tipo":     "offline",
                "mensagem": "Sem dados > 5 min",
                "severity": "critical",
            })
            continue

        status = resumo.get("status", {})
        vel    = status.get("vel") or 0
        prod   = status.get("prod_turno") or status.get("contador_boas") or 0

        if vel < 5:
            avisos.append({
                "machine":  serial,
                "tipo":     "baixa_vel",
                "mensagem": f"Velocidade baixa ({vel} rpm)",
                "severity": "warning",
            })

        if prod == 0:
            avisos.append({
                "machine":  serial,
                "tipo":     "sem_producao",
                "mensagem": "Sem produção no turno",
                "severity": "warning",
            })

    return avisos
