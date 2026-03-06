from fastapi import APIRouter, Depends, Query
from app import influx
from app.auth import get_current_user
from app.models import Usuario

router = APIRouter(prefix="/metrics", tags=["Métricas"])


@router.get("/{serial}/atual")
def metricas_atuais(
    serial: str,
    janela: str = Query(default="-1h", description="Ex: -1h, -8h, -24h"),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Retorna os últimos valores de todos os campos
    para um serial de máquina.
    """
    return influx.query_metricas_recentes(serial, janela)


@router.get("/{serial}/oee")
def oee_atual(
    serial: str,
    janela: str = Query(default="-8h", description="Janela de cálculo do OEE"),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Retorna OEE, Disponibilidade, Performance e Qualidade
    calculados pelo Node-RED e gravados no InfluxDB.
    """
    return influx.query_oee_atual(serial, janela)


@router.get("/{serial}/historico/{field}")
def historico_campo(
    serial: str,
    field: str,
    janela: str = Query(default="-24h", description="Ex: -24h, -7d"),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Retorna histórico de um campo específico para gráficos.
    field pode ser: contador_boas, contador_ruins, velocidade, oee, etc.
    """
    return influx.query_historico(serial, field, janela)
