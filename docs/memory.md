# Project Memory

Chronological development history. Append new entries at the bottom. Never rewrite or delete earlier entries.

## 2026-09-25

### Change

Phase 1: project setup. Created the monorepo layout (`frontend/`, `backend/`, `docs/`), a React + Vite + TypeScript + Tailwind frontend shell, a Spring Boot + Maven backend with `GET /api/health`, MySQL configuration driven by environment variables, a Docker Compose file for local MySQL, and this memory file.

### Why

The spec requires a working foundation (frontend, backend, database config, health check) before any data model or provider work begins.

### Files Changed

- `.gitignore`, `.env.example`, `docker-compose.yml`, `README.md`
- `backend/pom.xml` (Spring Boot 3.5.6, Java 21; web, data-jpa, validation, actuator, mysql-connector-j; H2 for tests only)
- `backend/src/main/java/com/buyerintel/BuyerIntelApplication.java`
- `backend/src/main/java/com/buyerintel/controller/HealthController.java`
- `backend/src/main/java/com/buyerintel/exception/ApiError.java`, `GlobalExceptionHandler.java`
- `backend/src/main/java/com/buyerintel/config/CorsConfig.java`
- `backend/src/main/resources/application.properties`
- `backend/src/test/...` (`BuyerIntelApplicationTests`, `HealthControllerTest`, `GlobalExceptionHandlerTest`, test `application.properties`)
- `backend/db/create-database.sql` (native MySQL setup)
- Empty package folders with `.gitkeep`: `service/`, `provider/`, `repository/`, `entity/`, `dto/`
- `frontend/` (Vite scaffold; `vite.config.ts` with `/api` proxy, `src/lib/api.ts`, `src/hooks/useBackendHealth.ts`, layout, sidebar, pages for every route)
- `docs/memory.md`, `docs/setup.md`

### Decisions

- Spring Boot 3.5.6 chosen because its APIs are known exactly and the build environment could not verify a newer major. Upgrading to Spring Boot 4 is an open item (test annotation packages and starter names change).
- `spring.jpa.hibernate.ddl-auto=none` for Phase 1 (no entities yet). Phase 2 should add versioned migrations (Flyway) and switch to `validate`, so the schema is never silently changed by Hibernate.
- The frontend calls only `/api/*`. In development Vite proxies it to `localhost:8080`; CORS is configured for separately hosted builds.
- The backend loads an optional `.env` from `backend/` or the project root via `spring.config.import`. No credential has a default value in code.
- The DB is created as `utf8mb4` because buyer names include Cyrillic (e.g. Russian importers) and Arabic scripts.
- Pages that belong to later phases show an explicit "Planned for Phase N" state. No placeholder numbers, rows, or working-looking buttons. Leads is shown as "Coming soon" and is not clickable.
- The dashboard's backend status comes from a real call to `GET /api/health`.

### Result

- Frontend: `npm run build` succeeds, `npm run lint` reports 0 warnings and 0 errors, dev server runs on http://localhost:5173 and serves all routes. With the backend down, the UI shows "Backend unreachable" with a retry. The connected state was checked with a test-only network intercept, not by adding data to the app.
- Backend: **not yet compiled or run.** The build sandbox blocked Maven Central (`host_not_allowed`), so dependencies could not be downloaded. Sources were checked with `javac` for syntax; the only errors were unresolved Spring types. `mvn verify` and `mvn spring-boot:run` must be run on a developer machine to complete Phase 1.
- MySQL: configured, not connected yet (no server in the sandbox).

### Next Step

1. On a machine with Maven access: `mvn verify`, start MySQL, `mvn spring-boot:run`, confirm `/api/health` and `/actuator/health` (db `UP`), and confirm the frontend shows "Backend connected". Record the result as a new entry here.
2. Then Phase 2: `Buyer`, `Product`, `Market` entities, repositories, Flyway migrations, seed the six supported markets and the Coffee / 0901 product (reference config, not buyer data).

## 2026-09-25 (restructure)

### Change

Reorganized the whole project to match the agreed folder structure, and removed files outside it.

### Why

The project owner provided a definitive folder layout and asked for no extra folders or files.

### Files Changed

- Removed: root `.env.example`, `frontend/.env.example`, `frontend/README.md`, `frontend/.gitignore`, `frontend/.oxlintrc.json`, `frontend/tsconfig.app.json`, `frontend/tsconfig.node.json`, `frontend/public/favicon.svg`, `backend/db/create-database.sql` (its SQL moved into `docs/setup.md`), `backend/src/test/resources/`, `HealthController.java`, `ApiError.java`, and the earlier frontend files (`AppLayout`, `nav.ts`, `layoutContext.ts`, `BackendStatus`, `PageHeader`, `NotBuiltYet`, `lib/api.ts`, `hooks/useBackendHealth.ts`, Settings/Leads/NotFound pages).
- Frontend: `components/layout/{MainLayout,Sidebar,Header}.tsx`; `components/common/{Button,Badge,Loader,EmptyState,ErrorState}.tsx`; `pages/{Dashboard,BuyerDiscovery,BuyerDetails,Markets,DataSources}.tsx`; `services/api.ts`; `types/{buyer,product,market,datasource}.ts`; `utils/formatters.ts`; single `tsconfig.json`; `frontend/.env`.
- Backend: `DashboardController` (now serves `GET /api/health`); `BuyerNotFoundException`, `ProviderException`, updated `GlobalExceptionHandler`; `WebClientConfig`; `backend/.env`; `DashboardControllerTest`; placeholder classes for every later-phase file in the tree; empty `resources/db/migration/` and test `service/`, `repository/` folders.
- `docker-compose.yml`, `.gitignore`, `README.md`, `docs/setup.md` updated. Added `docs/architecture.md`, `docs/api.md`, `docs/database.md`.

### Decisions

- `GET /api/health` moved into `DashboardController`, because the tree has no health controller and the dashboard is where backend status is shown.
- Future-phase files exist as empty placeholders: Java classes with no annotations or members, React components that return `null` and are not rendered. Nothing exposes an endpoint or a control that pretends to work.
- Settings has no page in the tree, so it is now "Coming soon" in the sidebar, like Leads. Unknown routes redirect to `/dashboard`.
- Kept outside the listed files because the tools need them: `frontend/index.html` (Vite entry point) and `frontend/package-lock.json` (reproducible installs).
- `.env` files follow the tree but stay gitignored. They hold no secrets as shipped (passwords are blank). Their variables are documented in `setup.md` so a fresh clone can recreate them.
- Tests no longer use a separate test properties file: `DashboardControllerTest` sets H2 properties inline and loads the full context.
- Docker Compose now reads `backend/.env` via `--env-file`.

### Result

- Frontend: `npm run build` succeeds; `npm run lint` 0 warnings, 0 errors; dev server serves all routes; backend-unreachable state renders.
- Backend: `javac` syntax check clean apart from unresolved Spring types. **Still not compiled with Maven or run**, for the same reason as the previous entry (Maven Central blocked in the build sandbox).

### Next Step

Unchanged: run `mvn verify` and `mvn spring-boot:run` on a developer machine with MySQL, confirm both health endpoints, record the result here, then start Phase 2.

## 2026-09-26

### Change

Redesigned the frontend into a trade-intelligence dashboard, wired to real backend endpoints, without rebuilding the project. Also: backend set to Java 17, and `docs/project-context.md` added.

### Why

The Phase 1 screens read as a developer prototype. The owner asked for a product-quality UI (KPI strip, market activity, products, recent buyers, data sources, quick actions, proper empty and error states) that stays honest while the database is empty. The development machine runs Java 17. The owner's context document named `docs/project-context.md` as part of the docs.

### Files Changed

- `frontend/src/services/api.ts` – typed calls for health, dashboard stats, buyers (list, get, search, enrich), products, markets; `isEndpointMissing`, `isUnreachable`; static `DATA_SOURCES`.
- `frontend/src/hooks/useBuyers.ts` – `useResource`, `useBuyers`, `useBuyer`, five-state resource model.
- `frontend/src/types/` – buyer (labels, enrichment status), datasource (statuses, labels, tones).
- `frontend/src/utils/formatters.ts` – `formatCount`, `formatDate`, `toHref`.
- `frontend/src/components/common/*` – restyled; `ButtonLink`, `Skeleton`, banner variant and details toggle for `ErrorState`.
- `frontend/src/components/layout/*` – new sidebar (icons, "Coming later" group, data-status block), header (disabled search, connection pill, `PageHeading`), offline banner.
- `frontend/src/components/dashboard/*`, `search/BuyerSearchPanel.tsx`, `buyers/*` – implemented (previously empty placeholders).
- `frontend/src/pages/*` – all five pages rebuilt.
- `frontend/src/index.css` – extended tokens.
- `backend/pom.xml` – `java.version` 17.
- `docs/api.md`, `docs/architecture.md`, `docs/setup.md` updated; `docs/project-context.md` added.

### Decisions

- **No source is shown as "Connected".** The redesign brief asked for ITC Trade Map "Connected" and website enrichment "Available". Neither is built, so they show "Not connected" and "Planned"; Volza shows "Not configured". These live in `DATA_SOURCES` and must be replaced by `GET /api/data-sources` in Phase 3.
- **KPI "–" vs 0.** Until `/api/dashboard/stats` exists the KPIs show "–" (not counted). Once it exists, an empty database shows real zeros.
- **Endpoint missing is a normal state.** A `404 NOT_FOUND` from the backend means "not built yet" and renders an honest empty state, not an error. `BUYER_NOT_FOUND` is handled separately.
- **Buyer activity and top markets are one ranked visual** rather than two panels repeating the same numbers. No world map: no mapping library is installed and there is no data to map yet (Leaflet later).
- **Products page, Manage products, Reports, Leads, Settings** are shown as "Soon" and are not clickable: none has a page in the agreed folder structure.
- **Global search** is present but disabled until buyer data exists. No user/profile area: there is no authentication.
- **Dropdowns only show real options.** Product and market options come from `/api/products` and `/api/markets`; when empty they read "No products yet" / "No markets yet" and are disabled. On Buyer Discovery the fields are free text with suggestions, so a search is possible before reference data exists.
- Suggested component names from the brief were mapped onto the existing folder structure (KpiCard → `StatCard`, FilterBar → `BuyerSearchPanel`, MarketActivity/TopMarkets → `MarketOverview`); DataSourceStatus and QuickActions live inside `Dashboard.tsx` because the structure has no files for them.

### Result

- `npm run build` succeeds; `npm run lint` 0 warnings, 0 errors.
- Verified in a headless browser at 1440, 820, and 390 px: no horizontal overflow. States checked: backend offline, backend up with endpoints missing, and populated data. Populated and "endpoint missing" states used network interception inside the test script only, with synthetic rows; nothing was added to the app.
- Backend still not compiled with Maven in the build sandbox; unchanged apart from the Java version.

### Next Step

1. On the developer machine: `mvn verify`, `mvn spring-boot:run` with MySQL, confirm both health endpoints and the "Connected" pill.
2. Phase 2: Flyway migration for `buyers`, `products`, `markets`; entities and repositories; seed the six markets and Coffee / 0901; implement `GET /api/products` and `GET /api/markets` so the dropdowns and Markets page fill with real rows.
3. Then aim for the first real record end to end: ITC → Spring Boot → MySQL → API → React.

## 2026-09-27

### Change

- Replaced the initial admin-style dashboard landing page.
- Introduced a full-screen global buyer intelligence hero.
- Added an interactive 3D globe.
- Added ITC Trade Map as an external source (official website link).
- Added Volza as an external source (official website link; API not configured).
- Removed the backend dependency from the landing page and from rendering of every page.
- Preserved the Spring Boot provider architecture for future real API integration.
- No fake business data introduced.

### Why

The owner wanted the first screen to read as a commercial trade-intelligence product rather than an admin panel, to reach ITC Trade Map and Volza directly, and to work while Spring Boot is not running locally.

### Files Changed

- Added `frontend/src/components/dashboard/Globe.tsx` (the one file outside the agreed folder list; the globe needs its own module so three.js loads lazily).
- Added `frontend/src/assets/earth-day.jpg`, `earth-night.jpg`, `earth-water.jpg`, `earth-clouds.jpg` (NASA imagery via the MIT-licensed three-globe package, resized to ~900 kB total).
- `frontend/src/pages/Dashboard.tsx` – now the landing page at `/`.
- `frontend/src/components/layout/Header.tsx` – top navigation bar replaces the sidebar; `Sidebar.tsx` – now the mobile drawer and shared nav/source links; `MainLayout.tsx` – no health check, no banner.
- `frontend/src/App.tsx` – `/` is the landing; `/dashboard` redirects to it.
- `frontend/src/pages/DataSources.tsx` – two source cards with official links; Connection status (backend API, MySQL) moved here.
- `frontend/src/pages/Markets.tsx` – six target markets from configuration; counts and market activity only when real records exist.
- `frontend/src/pages/BuyerDiscovery.tsx`, `components/buyers/BuyerProfile.tsx` – "Buyer discovery service is currently unavailable." with Retry.
- `frontend/src/components/dashboard/RecentBuyers.tsx` – renders only when real buyers exist; now shown on Buyer Discovery.
- `frontend/src/components/search/BuyerSearchPanel.tsx`, `services/api.ts`, `types/datasource.ts`, `types/market.ts`, `index.css`, `vite.config.ts` (`/actuator` proxy, chunk warning limit).
- `frontend/package.json` – added `three` 0.182.0 (pinned), `@react-three/fiber` 9, `@types/three` 0.182.0.
- `docs/architecture.md`, `docs/setup.md`, `README.md`.

### Decisions

- **React Three Fiber + three.js, not Globe.gl**, for full control of the look (custom day/night shader, atmosphere, clouds). No drei: three.js's own OrbitControls covers drag and zoom.
- **Globe markers show the six target markets and India as origin.** These are configuration (approximate country centroids), not data. No trade routes or counts are drawn. The hover readout shows real pointer coordinates.
- **No source is "Connected".** ITC Trade Map: "External source". Volza: "External source" + "API not configured". Website enrichment is no longer listed on Data Sources, since the brief lists only the two trade sources; it remains planned (Phase 7).
- **Diagnostics are on Data Sources → Connection status**, not on the landing page. No global offline banner.
- **Markets renders from configuration** (`TARGET_MARKETS`) so it works without the backend; `/api/markets` remains the planned source once Phase 2 exists.
- three.js pinned to 0.182.0 to avoid a `THREE.Clock` deprecation warning that React Three Fiber triggers from 0.183 on.
- The brief's all-caps wording (headline, buttons, section label) was kept as specified.

### Result

- `npm run build` succeeds (TypeScript clean); `npm run lint` 0 warnings, 0 errors.
- Verified in headless Chromium (software WebGL) with **no backend running**: landing renders; globe renders, auto-rotates, responds to drag, zoom, and hover (readout showed live coordinates); ITC button opened `https://www.trademap.org/` and Volza `https://www.volza.com/` in new tabs with `window.opener` null; Explore Buyers → `/buyers`, Explore Markets → `/markets`, nav → `/data-sources`; no horizontal overflow at 1440, 1024, 820, 390 px.
- Console: no globe errors or warnings. The only entry was the Google Fonts request, blocked by the build sandbox's network (loads normally elsewhere).
- Backend unchanged.

### Next Step

1. Run the backend locally (`backend/.env` with real MySQL credentials; `mvn spring-boot:run` from `backend/`) and confirm Data Sources → Connection status shows both as running.
2. Phase 2: tables, entities, repositories; seed markets and Coffee / 0901.
3. Later: drive globe markers from real buyer locations once records exist.

## 2026-09-27 (re-verification)

### Change

Re-verified the landing-page redesign before delivery. An accidental `@react-three/drei` install was removed and `three` / `@types/three` re-pinned to exactly 0.182.0, restoring the decisions in the previous entry. Earth textures in `src/assets/` were regenerated from the same public-domain NASA sources (Blue Marble day, Black Marble night lights, water mask) at 2048×1024 / 1024×512.

### Why

Deliver the redesign in the project's root folder layout, confirmed working.

### Files Changed

- `frontend/package.json`, `frontend/package-lock.json`
- `frontend/src/assets/earth-day.jpg`, `earth-night.jpg`, `earth-water.jpg`

### Result

- `npm run build` succeeds; `npm run lint` 0 warnings, 0 errors. The globe is a separate lazy-loaded chunk.
- With no backend running: landing renders; globe renders and rotates at 1440 px and 390 px; OPEN ITC TRADE MAP and OPEN VOLZA open the official sites in new tabs with `window.opener` null; Explore Buyers → `/buyers`; Markets, Buyer Discovery, Data Sources routes render; no horizontal overflow; no globe console errors.

### Next Step

Unchanged: run the backend locally, then Phase 2.

## 2026-09-27 (folder structure alignment)

### Change

Aligned the project exactly with the agreed folder structure.

### Why

The project owner asked for the delivered project to match the given tree.

### Files Changed

- `frontend/src/components/dashboard/Globe.tsx` removed; its code moved into `frontend/src/pages/Dashboard.tsx`.
- `frontend/src/App.tsx` – lazy-loads the landing page, so three.js is still downloaded only for the landing page; the loading placeholder uses the landing's dark background.
- `docs/project-context.md` removed; its content moved into `README.md` under "Project context".
- `frontend/package-lock.json` removed from the delivery (`npm install` recreates it; three.js stays pinned at 0.182.0 in `package.json`).
- `docs/architecture.md`, `README.md` references updated.

### Decisions

- Kept outside the listed file names because the tools need them or the tree leaves the folder contents open: `frontend/index.html` (Vite entry point), images in `frontend/src/assets/`, and `DashboardControllerTest.java` in `backend/src/test/java/com/buyerintel/controller/`.
- Trade-off: the landing text now appears together with the globe code chunk instead of before it. The other pages are unaffected.

### Result

`npm run build` succeeds; `npm run lint` 0 warnings, 0 errors; landing, globe, source links, and navigation re-verified without the backend.

### Next Step

Unchanged: run the backend locally, then Phase 2.

## 2026-09-28

### Change

Froze the V1 requirements and restructured the project to match them. The backend technology changed from Spring Boot to FastAPI; the Spring Boot code was removed and `backend/` is empty until the FastAPI step. Project renamed to `buyer-intelligence/`.

### Why

The project owner locked V1: React + Vite + TypeScript, FastAPI, MySQL, ITC Trade Map and Volza as sources, a lean folder structure, and a build order that finishes the UI before the backend.

### Structure

```
buyer-intelligence/
├── backend/          (empty until FastAPI)
├── docs/  memory.md, goal.md
├── frontend/
│   ├── public/       earth textures
│   ├── src/  components/ pages/ services/ types/ App.tsx main.tsx index.css
│   ├── index.html package.json tsconfig.json vite.config.ts
├── .gitignore
└── README.md
```

Removed: Spring Boot backend, `docker-compose.yml`, `docs/architecture.md`, `api.md`, `database.md`, `setup.md` (their current content is folded into `goal.md` and `README.md`), `frontend/.env`, and the `hooks/`, `utils/`, `assets/` folders and component subfolders.

### Files Changed

- `frontend/src/components/` – flattened (Header, MainLayout, Navigation, Button, Badge, Loader, EmptyState, ErrorState, BuyerTable, BuyerCard, BuyerFilters, BuyerProfile, BuyerSearchPanel, RecentBuyers, MarketOverview, StatCard, Globe).
- `components/Globe.tsx` – globe extracted from the Dashboard again (lazy-loaded); market markers are now clickable.
- `pages/Dashboard.tsx` – rebuilt: title, Buyers / Markets / Products figures, global buyer map with a market panel (View buyers →, coffee importers on ITC), recent buyers.
- `pages/Products.tsx` – new: Coffee (HS 0901), Confectionery (HS not verified), View buyers →.
- `pages/BuyerDiscovery.tsx` + `components/BuyerSearchPanel.tsx` – Product / Country / Source → Search buyers; HS code comes from the product. When the backend is unavailable, offers the same search on the source's website.
- `pages/Markets.tsx` – View buyers → and a direct ITC link per focus market.
- `pages/DataSources.tsx` – connection status uses `/api/health` only (Spring Actuator removed).
- `pages/BuyerProfile.tsx` – shipment frequency row added.
- `services/api.ts` – FastAPI-style page shape `{ items, total, page, size }`; `sourceSearchUrl`; reference-data calls removed (products and markets are configuration).
- `services/useResource.ts`, `services/format.ts` (moved from `hooks/`, `utils/`).
- `types/product.ts` – `PRODUCTS`; `types/market.ts` – ISO codes and `ALL_COUNTRIES` from the browser's Intl region data.
- `vite.config.ts` – proxy to FastAPI on port 8000; no `.env` needed.
- `docs/goal.md` new; `README.md`, `.gitignore` rewritten.

### Decisions

- **Figures on the dashboard.** Markets (6) and Products (2) count configured lists and are labelled as such. Buyers shows "–" until the backend reports a real count. The brief's "583" is not shown.
- **Global search, focus markets.** Country dropdown lists focus markets first, then every country.
- **The map drives the workflow.** Clicking a market marker opens a panel with View buyers → (Buyer Discovery filtered to that country). Buyer counts in the panel appear only with real data.
- **Source hand-off.** For ITC, the link opens the importing-companies page for the product and country (`/en/goods/companies/c/{ISO numeric}/imports/p/{HS}`), the pattern observed for Russia / 0901. The same pattern is used for the other five focus markets; not yet checked by hand for each.
- **Confectionery has no HS code** until one is verified, so no deep link is built for it.

### Result

- `npm run build` succeeds; `npm run lint` 0 warnings, 0 errors. Globe is a separate lazy chunk.

### Next Step

1. Finish V1 UI steps with the owner's feedback.
2. Step 8: FastAPI implementing the endpoints listed in `goal.md`.
3. Step 9: MySQL.
