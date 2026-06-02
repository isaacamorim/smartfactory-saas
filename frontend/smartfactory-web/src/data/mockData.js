// src/data/mockData.js
export const MACHINES = [
  { id:1, serial:"EVA1000-00021", modelo:"EVA1000", empresa:"NH Alimentos", linha:"Linha 01", status:"online",  vel:42, oee:75.3, boas:4821, ruins:89, peso:500, turno:"Carlos M."  },
  { id:2, serial:"EVA1000-00022", modelo:"EVA1000", empresa:"NH Alimentos", linha:"Linha 02", status:"offline", vel:0,  oee:0,    boas:2100, ruins:0,  peso:0,   turno:"—"          },
  { id:3, serial:"EVA1000-00023", modelo:"EVA1000", empresa:"NH Alimentos", linha:"Linha 03", status:"online",  vel:38, oee:81.2, boas:4990, ruins:44, peso:500, turno:"Marcos P."  },
];

export const ALARMS = [
  { id:1, sev:"critical", nome:"Parada por falha mecânica",        maquina:"EVA1000-00022", linha:"Linha 02", hora:"08:42", ativo:true  },
  { id:2, sev:"warn",     nome:"Peso fora do padrão (>505g)",       maquina:"EVA1000-00021", linha:"Linha 01", hora:"09:15", ativo:true  },
  { id:3, sev:"info",     nome:"Troca de operador registrada",      maquina:"EVA1000-00021", linha:"Linha 01", hora:"07:00", ativo:false },
  { id:4, sev:"info",     nome:"Parâmetro de velocidade alterado",  maquina:"EVA1000-00023", linha:"Linha 03", hora:"06:45", ativo:false },
  { id:5, sev:"warn",     nome:"Temperatura do motor elevada",      maquina:"EVA1000-00021", linha:"Linha 01", hora:"10:02", ativo:true  },
];

export const MANUTENCAO = [
  { id:1, serial:"EVA1000-00022", tipo:"Corretiva",  descricao:"Falha na correia de transmissão", tecnico:"João S.",  inicio:"08:42", fim:"—",     status:"aberta"    },
  { id:2, serial:"EVA1000-00021", tipo:"Preventiva", descricao:"Lubrificação dos rolamentos",     tecnico:"Pedro A.", inicio:"06:00", fim:"06:30", status:"concluida" },
  { id:3, serial:"EVA1000-00023", tipo:"Preventiva", descricao:"Calibração de sensores de peso",  tecnico:"Pedro A.", inicio:"05:45", fim:"06:20", status:"concluida" },
];

export const NAV_ITEMS = [

  {
    section: "Operação"
  },

  {
    id: "empresa_dashboard",
    label: "Dashboard",
    icon: "📊"
  },

  {
    id: "alarmes",
    label: "Alarmes",
    icon: "🚨"
  },

  {
    id: "manutencao",
    label: "Manutenção",
    icon: "🔧"
  },

  {
    section: "Cadastros"
  },

  {
    id: "empresas",
    label: "Empresas",
    icon: "🏭"
  },

  {
    id: "linhas",
    label: "Linhas",
    icon: "📂"
  },

  {
    id: "maquinas",
    label: "Máquinas",
    icon: "⚙"
  },

  {
    id: "usuarios",
    label: "Usuários",
    icon: "👤"
  },

  {
    id: "metas",
    label: "Metas OEE",
    icon: "🎯"
  },

  {
    id: "parametros",
    label: "Parâmetros CLP",
    icon: "🛠"
  }

];