# Buyer Intelligence

A dashboard for discovering potential international buyers for the products we export: coffee and confectionery first, more later.

**Workflow:** Dashboard → Product + Country + Source → Buyer Discovery → Buyer list → Buyer profile → Map / market analysis.

The platform never shows invented buyers, contacts, or statistics. Missing information shows as "—" or "N/A".

```
frontend/   React + Vite + TypeScript (Tailwind, React Router, three.js globe)
backend/    FastAPI (not started yet: step 8 of the V1 plan)
docs/       goal.md (frozen V1 requirements) · memory.md (development history)
```

## Run the frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

The frontend works on its own. Buyer search needs the backend; until it exists, Buyer Discovery says the service is unavailable and offers to open the same search on ITC Trade Map or Volza.

`/api` requests are forwarded to `http://localhost:8000` (FastAPI's default). To use another address: `VITE_API_PROXY_TARGET=http://localhost:9000 npm run dev`.

## Data sources

- **ITC Trade Map** – https://www.trademap.org/ – trade intelligence and importing companies.
- **Volza** – https://www.volza.com/ – shipment intelligence.

Neither is connected by API yet. Both are used through their official websites.

See [docs/goal.md](docs/goal.md) for the V1 scope and [docs/memory.md](docs/memory.md) for what has been built.
