# WhatsWaiter MVP

Monorepo prototype for the WhatsWaiter system, allowing restaurant orders via WhatsApp.

## Packages

- `packages/bot-service` – TypeScript helpers for the Evolutio Cloud API and MongoDB models.
- `packages/agent-ai` – FastAPI micro-service returning simple menu suggestions.
- `packages/kitchen-panel` – React + Vite panel that receives real-time orders.
- `packages/n8n-flows` – Versioned n8n workflows (placeholders).
- `infra` – Docker Compose and MongoDB initialization scripts.

## Development

```bash
npm install
pip install -r packages/agent-ai/requirements.txt
npm test
pytest packages/agent-ai/tests
```
