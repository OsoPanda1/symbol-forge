# Symbol Forge (RDM Digital)

Plataforma de forja simbólica con frontend inmersivo, backend serverless y controles de seguridad operativa.

## Estado actual

- Generación estética client-side con múltiples alfabetos/sellos.
- Módulo ALPHA con forja de símbolos y flujo económico.
- Integración Supabase (datos, auth, observabilidad) y Stripe (checkout + webhook firmado).
- Controles base de hardening: validación con Zod, sanitización, rate limit, antifraude y logs estructurados.

## Novedades recientes

- Audio ambiental inmersivo con mezcla contextual por sección (`#hero` y `#forge`) usando assets locales.
- Integración de imágenes de identidad visual en Hero y módulo Aesthetics.
- Nuevo estilo tipográfico `ANUBIS.IDENTITY`.
- Atlas de símbolos especiales + sugerencia determinista de sigilo para identidad social/gamer.

## Estructura principal

- `src/components/*`: UI modular (Hero, Aesthetics, AlphaForge, Audio, Logs, etc.).
- `src/lib/aesthetics.ts`: motor de estilos Unicode.
- `src/lib/symbol-atlas.ts`: catálogo de símbolos especiales y sigilo determinista.
- `src/lib/security.ts`: sanitización y controles defensivos.
- `src/routes/api/public/stripe-webhook.ts`: webhook Stripe firmado e idempotente.
- `src/integrations/supabase/*`: clientes, middleware y tipos.
- `supabase/migrations/*`: esquema, hardening y lógica SQL.

## Scripts

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
```

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

## Objetivo operativo

Evolucionar de MVP robusto a plataforma SaaS con estándares enterprise: observabilidad total, seguridad defensiva, resiliencia, costos controlados y despliegue continuo.
