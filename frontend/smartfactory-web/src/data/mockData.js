// src/data/mockData.js
// Apenas dados estáticos que não vêm da API (mock de métricas até InfluxDB estar integrado)

export const MACHINES = [
  { id:1, serial:"EVA1000-00021", status:"online",  oee:75.3 },
  { id:2, serial:"EVA1000-00022", status:"offline", oee:0    },
  { id:3, serial:"EVA1000-00023", status:"online",  oee:81.2 },
];

export const NAV_ITEMS = [
  { section: "OPERAÇÃO" },
  { id:"dashboard",  icon:"◈", label:"Dashboard"  },
  { id:"oee",        icon:"◎", label:"OEE"        },
  { id:"maquinas",   icon:"⬡", label:"Máquinas",  badge:3, badgeColor:"var(--green)" },
  { id:"producao",   icon:"≋", label:"Produção"   },
  { id:"alarmes",    icon:"△", label:"Alarmes",   badge:2, badgeColor:"var(--red)"   },
  { id:"manutencao", icon:"⚙", label:"Manutenção" },
  { section: "CADASTROS" },
  { id:"empresas",   icon:"⬜", label:"Empresas"  },
  { id:"linhas",     icon:"—", label:"Linhas"     },
  { id:"maquinas",   icon:"⬡", label:"Máquinas"  },
  { id:"usuarios",   icon:"◻", label:"Usuários"   },
  { id:"metas",      icon:"✦", label:"Metas OEE"  },
];
