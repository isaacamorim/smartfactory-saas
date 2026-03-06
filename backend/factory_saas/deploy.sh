#!/bin/bash
# Script de deploy do Smart Factory SaaS API
# Execute no servidor: bash deploy.sh

set -e

echo "========================================"
echo "  Smart Factory SaaS - Deploy"
echo "========================================"

# 1. Atualiza pacotes
echo "[1/6] Atualizando sistema..."
apt update -qq

# 2. Instala Python e pip se não tiver
echo "[2/6] Verificando Python..."
apt install -y python3 python3-pip python3-venv

# 3. Entra na pasta do projeto
cd /opt/factory_saas

# 4. Cria ambiente virtual
echo "[3/6] Criando ambiente virtual..."
python3 -m venv venv
source venv/bin/activate

# 5. Instala dependências
echo "[4/6] Instalando dependências..."
pip install --quiet -r requirements.txt

# 6. Cria serviço systemd para rodar a API em background
echo "[5/6] Configurando serviço..."
cat > /etc/systemd/system/factory-saas.service << EOF
[Unit]
Description=Smart Factory SaaS API
After=network.target

[Service]
User=root
WorkingDirectory=/opt/factory_saas
Environment="PATH=/opt/factory_saas/venv/bin"
ExecStart=/opt/factory_saas/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# 7. Habilita e inicia o serviço
echo "[6/6] Iniciando serviço..."
systemctl daemon-reload
systemctl enable factory-saas
systemctl restart factory-saas

echo ""
echo "========================================"
echo "  Deploy concluído!"
echo "  API rodando em: http://191.252.217.250:8000"
echo "  Documentação:   http://191.252.217.250:8000/docs"
echo "========================================"
