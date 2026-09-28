# V1 Goal

Frozen requirements for the first version. Changes to scope are recorded in `memory.md`.

## Purpose

Help the company discover potential buyers for its products (coffee and confectionery first) in countries around the world, using real trade intelligence.

The system identifies **potential buyers with documented import activity**. It never claims a company currently needs a product; import activity is a signal, not proof of demand.

## Workflow

Dashboard → Product + Country + Source → Buyer Discovery → Buyer list → Buyer profile → Map / market analysis

## Technology

| Layer | Choice |
|-------|--------|
| Frontend | React + Vite + TypeScript, Tailwind CSS, React Router |
| Map | three.js / React Three Fiber globe |
| Backend | FastAPI (step 8) |
| Database | MySQL (step 9) |
| Sources | ITC Trade Map, Volza |

## Build order

1. React UI
2. Dashboard
3. Buyer Discovery screen
4. Buyer table
5. Buyer profile
6. Map
7. Data Sources
8. FastAPI
9. MySQL
10. Real data workflow

## Pages

- **Dashboard** – buyers, markets, and products figures; global buyer map; recent buyers.
- **Buyer Discovery** – Product, Country, Source → Search buyers → buyer table.
- **Buyer Profile** – company, country, city, product, HS code; contact person, designation, email, phone; last shipment, shipment frequency, quantity; data source.
- **Markets** – focus markets; buyer counts per market once real data exists.
- **Products** – Coffee (HS 0901), Confectionery (HS code to be verified); view buyers per product.
- **Data Sources** – ITC Trade Map and Volza, each opening its official site.

## Products and countries

- Products: Coffee (HS 0901, verified), Confectionery (HS code not yet verified). More can be added. Arabica, Robusta, and instant-coffee HS codes are added only once verified.
- Countries: every country can be searched. Initial research focus: Russia, South Africa, Nigeria, Egypt, Morocco, Kenya.

## Data rules

- No fake buyers, companies, contacts, shipments, statistics, or charts.
- Missing values stay empty and show as "—" / "N/A".
- Every buyer record states its source.
- ITC Trade Map and Volza are not accessed by API until legitimate access exists. No scraping behind logins, CAPTCHAs, or paywalls.
- Location language: "highest concentration of identified importers", never consumption claims without consumption data.

## Not in V1

AI, RAG, authentication, CRM, lead scoring, email automation, ML, microservices, Docker, Kubernetes, cloud deployment, complex database design.

## API the frontend expects (for step 8)

The frontend already calls these. Until they exist it shows honest "unavailable" states. All paths are under `/api`; the dev server forwards them to `http://localhost:8000`.

| Method | Path | Returns |
|--------|------|---------|
| GET | `/api/health` | `{ "status": "ok", "database": "ok" \| "down" }` (`database` optional) |
| GET | `/api/dashboard/stats` | `{ totalBuyers, marketsCovered, productsCovered, activeImporters, buyersByMarket: [{ country, count }], buyersByProduct: [{ product, hsCode, count }] }` |
| GET | `/api/buyers?product=&country=&city=&source=&page=1&size=20&sort=-created_at` | `{ items: Buyer[], total, page, size }` |
| GET | `/api/buyers/{id}` | `Buyer`; unknown id → 404 with `code: "BUYER_NOT_FOUND"` |
| POST | `/api/buyers/search` | body `{ product, country, hsCode, source }` (`source`: `ITC` or `VOLZA`) → `Buyer[]` |
| POST | `/api/buyers/{id}/enrich` | updated `Buyer` |

`Buyer` fields (camelCase JSON): `id, companyName, country, city, product, hsCode, website, contactName, contactRole, email, phone, activityType, source, partnerCountry, lastConfirmedActive, enrichmentStatus, createdAt, updatedAt`. Everything except `id`, `companyName`, `country`, `source`, and the timestamps may be `null`.

Errors: JSON `{ status, code, message }`. A missing endpoint must return 404 with `code: "NOT_FOUND"` so the UI can tell "not built yet" apart from a real error. A source without access returns 503 with `code: "PROVIDER_NOT_CONFIGURED"`.
