# RDM Digital / Symbol Forge

Plataforma operativa de forja simbólica con backend serverless, economía transaccional y hardening productivo sobre Supabase + Stripe.

## Implementación funcional entregada

- Forja texto/imagen con validación estricta y controles antiabuso.
- Pagos Stripe con webhook firmado + idempotencia de eventos.
- Ownership ledger y desbloqueo de símbolos por orden pagada.
- Rate-limit distribuido (RPC en PostgreSQL/Supabase) con fallback local.
- Control de reputación de IP (`allow/challenge/block`).
- API de observabilidad con paginación server-side y export CSV.
- API de búsqueda híbrida IA (`/api/ai/search`) con ranking léxico+semántico.
- UI de consola de logs con paginación cliente.

## Interfaces clave

- `POST /api/public/stripe-webhook`
- `getOpsLogs({ page, pageSize, level })` (server function)
- `exportOpsLogsCsv({ page, pageSize })` (server function)
- `searchSymbolsHybrid({ q, limit })` (server function)

## Seguridad/hardening aplicado

- Sanitización de input y SVG.
- Rate limit distribuido por llave hash IP+UA.
- Bloqueo por reputación de IP.
- Detección antifraude por scoring.
- Validación de payload con Zod.
- Observabilidad persistente (`app_logs`, `app_metrics`).

## Migraciones nuevas

- `supabase/migrations/20260523170000_sot_advanced_controls.sql`
  - `rate_limit_events`
  - `ip_reputation`
  - `symbol_embeddings`
  - función `rl_take`
  - función `match_symbols_hybrid`

## Desarrollo

```bash
npm install
npm run dev
npm run typecheck
npm run build
```
