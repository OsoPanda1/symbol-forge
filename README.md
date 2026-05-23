# RDM Digital / Symbol Forge

Sistema de **forja simbólica** con economía digital, pagos Stripe y trazabilidad operativa sobre Supabase.

## ¿Qué es este proyecto?

RDM Digital (Symbol Forge) es una plataforma que combina:

- **Experiencia visual inmersiva** (narrativa/cinemática + UI temática).
- **Forja de símbolos** (texto e imagen) con pipeline determinista + apoyo de IA.
- **Motor económico transaccional** (órdenes, sigils, desbloqueos, ownership ledger).
- **Integración de pagos reales con Stripe** (checkout + webhook firmado + idempotencia).
- **Base de observabilidad y antiabuso** (logs, métricas, rate-limit y señales antifraude).

---

## Estado actual (implementado)

### Frontend
- Página principal inmersiva con módulos de forja y autenticación.
- Consola operativa “tamv.log” en vivo con historial paginado de eventos visuales.

### Backend/API (TanStack Start)
- Endpoints y server functions para:
  - Forja de texto e imagen.
  - Creación de sesión de checkout Stripe.
  - Recepción y procesamiento de webhook público de Stripe.

### Datos (Supabase)
- Persistencia de órdenes y sigils.
- Registro de eventos de webhook para deduplicación/idempotencia.
- Ledger de ownership para desbloqueos simbólicos.

---

## Arquitectura real del repositorio

- `src/routes/*`: rutas app + rutas API.
- `src/lib/forge.functions.ts`: núcleo de forja (validación, antiabuso, candidatos IA/deterministas).
- `src/lib/stripe.functions.ts`: creación de checkout session.
- `src/routes/api/public/stripe-webhook.ts`: webhook Stripe firmado e idempotente.
- `src/lib/security.ts`: rate-limit, sanitización SVG y limpieza de inputs.
- `src/lib/observability.ts`: logs y métricas de aplicación.
- `src/integrations/supabase/*`: cliente server/client y auth middleware.

---

## Hardening aplicado

- Verificación de firma de webhook Stripe.
- Dedupe de eventos por `event.id`.
- Rate limiting por IP/UA hash en flujos sensibles.
- Sanitización de entradas de texto y SVG.
- Validación estricta de payload con Zod.
- Señales antifraude para bloqueo temprano.

---

## Riesgos detectados (pendientes de evolución)

1. **Rate-limit en memoria local**: no distribuido entre instancias.
2. **Dependencia IA externa**: requiere timeout y fallback (ya existe fallback, se reforzó timeout).
3. **Observabilidad basada en DB**: recomendable complementar con alerting/trace externo.
4. **Gobernanza/moderación**: requiere flujo humano para casos críticos.

---

## Roadmap técnico recomendado

1. **Seguridad productiva avanzada**
   - Rate-limit distribuido (Redis/Upstash).
   - Reglas WAF y listas dinámicas de IP reputacional.

2. **Economía y gobernanza**
   - Ledger contable doble entrada.
   - Reglas de reconciliación de pagos y estados de órdenes.

3. **IA simbólica operativa**
   - Ranking de calidad de candidatos.
   - Búsqueda semántica híbrida (pgvector + filtros de dominio).

4. **Escalamiento UX**
   - Panel operacional con paginación server-side.
   - Timeline de eventos con auditoría y export.

---

## Variables de entorno

```bash
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

LOVABLE_API_KEY=

RATE_LIMIT_WINDOW=60
RATE_LIMIT_MAX=30
```

---

## Desarrollo local

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
```

---

## Despliegue

Este repo está preparado para despliegue en edge/serverless con el stack actual (TanStack Start + Cloudflare/Vite), y puede evolucionar a Vercel si se decide una migración estructural del framework.

---

## Visión

RDM Digital apunta a consolidarse como un **Sistema Operativo Territorial simbólico**: identidad + economía + experiencia + gobernanza, con seguridad y trazabilidad como requisitos de base.
