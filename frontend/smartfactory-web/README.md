# Smart Factory Web — Frontend SaaS

Interface industrial para monitoramento de máquinas, OEE e gestão multiempresa.

---

## Estrutura do projeto

```
smartfactory-web/
│
├── index.html                    ← entry point HTML
├── vite.config.js                ← config Vite + proxy API
├── package.json
│
└── src/
    ├── main.jsx                  ← bootstrap React
    ├── App.jsx                   ← roteador + layout raiz
    │
    ├── styles/
    │   └── globals.css           ← tokens, animações, classes base
    │
    ├── data/
    │   └── mockData.js           ← dados mock (substituir por API)
    │
    ├── services/
    │   └── api.js                ← todas as chamadas à FastAPI
    │
    ├── hooks/
    │   └── useAuth.js            ← hook de autenticação JWT
    │
    ├── components/               ← componentes reutilizáveis
    │   ├── Sidebar.jsx           ← menu lateral
    │   ├── Navbar.jsx            ← topbar + ticker + status
    │   ├── Table.jsx             ← tabela genérica
    │   ├── Form.jsx              ← formulário genérico
    │   └── UI.jsx                ← StatCard, OEEGauge, ProgressBar...
    │
    └── pages/                    ← uma página por rota
        ├── LoginPage.jsx
        ├── DashboardPage.jsx
        ├── OEEPage.jsx
        ├── MaquinasPage.jsx
        ├── ProducaoPage.jsx
        ├── AlarmesPage.jsx
        ├── ManutencaoPage.jsx
        ├── EmpresasPage.jsx
        └── MetasPage.jsx
```

---

## Como rodar

```bash
# 1. Instalar dependências
npm install

# 2. Rodar em desenvolvimento
npm run dev
# Acesse: http://localhost:3001

# 3. Build para produção
npm run build
```

---

## Conectar à API real

Edite `src/services/api.js`:

```js
const BASE_URL = "http://191.252.217.250:8000";
```

Substitua os dados mock nos arquivos de página pelos hooks da API:

```js
// Antes (mock):
import { MACHINES } from "../data/mockData";

// Depois (API real):
import { maquinasAPI } from "../services/api";
const [machines, setMachines] = useState([]);
useEffect(() => { maquinasAPI.listarPorEmpresa(1).then(setMachines); }, []);
```

---

## Componentes reutilizáveis

### `<Table columns data onRowClick />`
```jsx
<Table
  columns={[
    { key:"serial", label:"Serial", render: v => <span>{v}</span> },
    { key:"oee",    label:"OEE" }
  ]}
  data={machines}
  onRowClick={(row) => console.log(row)}
/>
```

### `<Form fields onSubmit onCancel />`
```jsx
<Form
  title="Cadastrar Máquina"
  fields={[
    { name:"serial", label:"Serial", placeholder:"EVA1000-00045" },
    { name:"linha",  label:"Linha",  type:"select", options:[...] },
  ]}
  onSubmit={(values) => api.criar(values)}
  onCancel={() => setShowForm(false)}
/>
```

### `<StatCard />` `<OEEGauge />` `<ProgressBar />`
```jsx
<StatCard label="OEE" value={75.3} unit="%" delta="▲ +3%" accent="var(--cyan)" />
<OEEGauge value={75.3} size={160} color="var(--cyan)" />
<ProgressBar label="Disponibilidade" value={88} meta={85} color="var(--cyan)" />
```
