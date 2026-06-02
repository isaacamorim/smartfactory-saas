import React from 'react';
import OEEPieChart from './OEEPieChart';

const LinhaCard = ({ linha, onClick }) => {
  const statusColor = linha.alertas > 0 ? 'var(--red)' : 'var(--green)';

  return (
    <div className="sf-card" onClick={onClick} style={{ cursor: 'pointer', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16 }}>{linha.nome}</h3>
          <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
            {linha.maquinas_online} / {linha.total_maquinas} MÁQUINAS ONLINE
          </span>
        </div>
        <div style={{ 
          width: 10, height: 10, borderRadius: '50%', 
          background: statusColor, boxShadow: `0 0 8px ${statusColor}` 
        }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <OEEPieChart value={linha.oee || 0} size={80} />
        
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: 'var(--text3)' }}>PRODUÇÃO ATUAL</div>
            <div style={{ fontSize: 18, fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
              {linha.producao_real} <span style={{ fontSize: 10 }}>un</span>
            </div>
          </div>
          
          {linha.alertas > 0 && (
            <div className="chip chip-red" style={{ fontSize: 9 }}>
              ⚠️ {linha.alertas} ALERTAS
            </div>
          )}
        </div>
      </div>
      
      <button className="btn-secondary" style={{ width: '100%', marginTop: 15, fontSize: 11 }}>
        DETALHAR LINHA
      </button>
    </div>
  );
};

export default LinhaCard;
