### Plano de Ação Técnico - MVP WhatsWaiter (WW)

*(roteiro passo-a-passo para o agente Codex operar no GitHub, gerar código, pipelines, infraestrutura e deixar o produto apto a rodar em produção piloto)*

---

## 0 · Premissas iniciais

| Item                | Valor / escolha                                   | Observação                                   |
| ------------------- | ------------------------------------------------- | -------------------------------------------- |
| Linguagem principal | **TypeScript/Node.js**                            | Uniformiza n8n custom nodes + micro-serviços |
| Repositório GitHub  | `whatswaiter/whatswaiter-mvp`                     | Monorepo com *workspaces*                    |
| Deploy alvo         | Docker Compose (dev)  → Docker Swarm / ECS (prod) | Facilita “lift-and-shift”                    |
| DB                  | **MongoDB Atlas** (free tier)                     | String conex. via secrets                    |
| Cache / sessão      | **Redis Cloud** (30 MB)                           | Usado por n8n e Bot                          |
| Bot WhatsApp        | **Evolutio Cloud API**                            | Webhook n8n                                  |
| Orquestração flows  | **n8n (Docker)**                                  | Flows versionados em Git                     |
| Agent AI            | micro-serviço FastAPI + OpenAI API                | Sugestões básicas                            |
| Painel Cozinha      | React + Vite + Socket.IO                          | Build estático servido por Nginx             |

---

## 1 · Bootstrap do Repositório

1. **Criar monorepo**

   ```bash
   npx create-nx-workspace@latest whatswaiter-mvp --preset=ts
   ```
2. **Definir workspaces:**
   `packages/`

   * `bot-service/` (SDK Evolutio + helpers)
   * `agent-ai/` (FastAPI)
   * `kitchen-panel/` (React)
   * `infra/` (Docker, compose, k8s manifests)
   * `docs/` (ADR, OpenAPI, READMEs)
3. **Adicionar template de issues & PRs** (`.github/ISSUE_TEMPLATE`, `.github/PULL_REQUEST_TEMPLATE.md`).
4. **Configurar Husky + Commitlint** para convenção *conventional commits*.

---

## 2 · Integração Contínua / Entrega Contínua

1. **GitHub Actions**

   * Workflow `ci.yml`: *install*, *lint*, *test*, *build* para cada workspace.
   * Workflow `docker.yml`: build & push imagens `ghcr.io/whatswaiter/<service>:sha`.
   * Workflow `deploy-dev.yml`: `ssh` para VPS dev e roda `docker compose pull && up -d`.
2. **Secrets**:

   * `EVOLUTIO_TOKEN`, `MONGO_URI`, `REDIS_URI`, `OPENAI_KEY`, `DEV_SSH_KEY`.

---

## 3 · Infraestrutura como código

1. **Docker Compose** (`infra/docker-compose.dev.yml`)

   * `n8n` (with volume `/home/node/.n8n`)
   * `mongo`
   * `redis`
   * `agent-ai`
   * `kitchen-panel` (nginx)
2. **docker-compose.prod.yml** + `.env.prod.template` (para secrets).
3. **K8s manifests** (opcional) em `infra/k8s/` para futura migração.

---

## 4 · Bot Service / SDK

1. Criar lib `bot-service` com:

   * wrapper para **Evolutio Cloud API** (`axios` + retry).
   * verificação de assinatura do webhook.
   * funções helper `sendText`, `sendImage`, `sendList`.
2. Expor tipagens `MessageContext`, `SessionData`.

---

## 5 · n8n Workflows versionados

> **Estratégia:** exportar cada workflow como arquivo JSON e commitar em `packages/n8n-flows/`.

1. **flow-onboarding.json**

   * Trigger: `message == '/start'` ou primeiro contato.
   * Ações: pedir nome → salvar em `clientes` Mongo.
2. **flow-show-menu.json**

   * Consulta `cardapios` por restaurante → loop imagens.
3. **flow-build-order.json**

   * Armazena itens temporariamente no Redis (`session:<mesaId>`).
   * Confirmação e gravação em `pedidos`.
   * Webhook `POST /orders` para painel cozinha (Socket.IO emit).
4. **flow-payment.json**

   * Gera QR-Code PIX (lib `qrcode` + chave pix do restaurante).
5. **flow-suggestions.json**

   * Detecta cliente recorrente → chama `agent-ai/api/suggest` e envia mensagem.

---

## 6 · Schema MongoDB

Implementar script em `infra/mongo-init.js` (executado pelo container) criando:

```js
db.createCollection("restaurantes");
db.createCollection("cardapios");
db.createCollection("clientes");
db.createCollection("pedidos");
db.restaurantes.createIndex({ nome: 1 }, { unique: true });
db.clientes.createIndex({ telefone: 1 }, { unique: true });
```

> **Codex**: gerar modelos Mongoose em `packages/bot-service/src/models/`.

---

## 7 · Agent AI Micro-serviço

1. FastAPI (`packages/agent-ai`)

   * Endpoint `POST /suggest` { telefone } → retorna lista top 3 itens via OpenAI embeddings + agregação Mongo.
   * Endpoint `POST /nutrition` opcional.
2. Dockerfile slim-python 3.11.
3. Unit-tests com `pytest`.

---

## 8 · Kitchen Panel

1. Scaffold:

   ```bash
   pnpm create vite kitchen-panel --template react-ts
   ```
2. Estrutura:

   * `/src/api/` (REST client axios)
   * `/src/components/OrderCard.tsx`
   * Socket.IO client escutando `order:new` e `order:update`.
   * Filtros por mesa / status.
3. `Dockerfile` com build e nginx serve `/dist`.

---

## 9 · Rotas auxiliares (Gateway)

Criar pequeno Express API (`packages/gateway`) se necessário para unir:

* `/webhook/evolutio` → n8n
* `/orders` (POST from n8n) → broadcast Socket.IO
* `/health` para uptime robot

---

## 10 · Observabilidade

1. **Logs estruturados** (pino + pino-http) em JSON.
2. **Prometheus exporter** ótimo-opcional.
3. n8n: habilitar `N8N_SKIP_DATA_STORAGE=true` em produção para reduzir disco.

---

## 11 · Pipeline de Dados (futuro próximo)

* Export nightly do Mongo para S3.
* BigQuery ou ClickHouse para análises (não no MVP).

---

## 12 · Ordem de Execução para Codex (lista detalhada)

| #  | Tarefa                                                        | Path                   | Comando / Ação                |
| -- | ------------------------------------------------------------- | ---------------------- | ----------------------------- |
| 1  | Criar repo + push estrutura vazia                             | root                   | `git init && gh repo create`  |
| 2  | Adicionar `infra/docker-compose.dev.yml` com serviços básicos | infra/                 | escrever YAML                 |
| 3  | Gerar Dockerfiles de `n8n`, `agent-ai`, `kitchen-panel`       | packages/\*            | cada pasta                    |
| 4  | Criar modelos Mongoose                                        | bot-service/src/models | `Cliente.ts`, …               |
| 5  | Implementar lib Evolutio wrapper                              | bot-service/src/       | `EvolutioClient.ts`           |
| 6  | Escrever scripts n8n export/import helper                     | scripts/               | `export_flows.ts`             |
| 7  | Criar flows JSON (5 principais)                               | packages/n8n-flows/    | arquivos .json                |
| 8  | Criar Agent AI FastAPI                                        | agent-ai/              | `main.py`, `requirements.txt` |
| 9  | Criar React painel                                            | kitchen-panel/         | componentes + socket          |
| 10 | Configurar Redis session util em flows                        | n8n nodes              | JS function nodes             |
| 11 | Escrever CI GitHub Actions                                    | .github/workflows/     | `ci.yml`, `docker.yml`        |
| 12 | Escrever README principal com instruções de dev               | root                   | Markdown                      |
| 13 | Rodar `docker compose up` (dev) e validar webhook ngrok       | local                  | testes                        |
| 14 | Adicionar testes unitários (agent-ai, lib bot)                | respective `__tests__` | `npm test`                    |
| 15 | Merge para `main`, tag `v0.1.0`                               | GitHub                 | release draft                 |
| 16 | Deploy em VPS Dev via GH Actions                              | infra/provision        | playbook ansible opcional     |
| 17 | Gerar docasciidoc pipeline (opcional)                         | docs/                  | ADR-001, etc.                 |

---

## 13 · Critérios de Aceite do Commit Final

1. `docker compose up` sobe todos containers sem erro.
2. POST dummy no webhook gera mensagem de resposta no WhatsApp sandbox.
3. Pedido aparece no painel em tempo real.
4. Testes unitários `npm test` e `pytest` passam (>= 90 % coverage nos módulos core).
5. GH Actions *green* em `main`.

---

