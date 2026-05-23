# RDM Digital / Symbol Forge
## Sistema Operativo Territorial (SOT) — Análisis Total + Guía de Implementación

> Estado del repositorio: **TanStack Start + React + Supabase + Stripe** con experiencia inmersiva de forja simbólica.
>
> Objetivo estratégico: evolucionar hacia un **SOT desplegable globalmente** (infraestructura + identidad + economía + IA + gobernanza + experiencia).

---

## 1) Resumen ejecutivo

Este proyecto ya opera como núcleo visual y transaccional de una plataforma de identidad simbólica:

- Frontend inmersivo con módulos de generación visual/simbólica.
- Integración de pagos con Stripe (checkout/webhook).
- Integración con Supabase (auth + persistencia).
- Señales SEO mejoradas con schema JSON-LD para rich results.

La expansión planteada en tu documento (Open Symbolic Network, embeddings vectoriales, genealogía simbólica, pipeline IA multicapa, visualización reactiva/3D, etc.) es viable si se estructura en fases de hardening + escalamiento.

---

## 2) Arquitectura actual del repo (real)

Estructura principal observada:

- `src/routes/*`: rutas de aplicación (TanStack Router).
- `src/components/*`: UI inmersiva (Hero, AlphaForge, MatrixRain, etc.).
- `src/lib/forge.functions.ts`: funciones de forja y selección.
- `src/lib/stripe.functions.ts`: funciones de Stripe checkout.
- `src/routes/api/public/stripe-webhook.ts`: webhook Stripe.
- `src/integrations/supabase/*`: clientes Supabase client/server y middleware auth.
- `supabase/migrations/*`: cambios de base de datos.

### Capacidades ya presentes

1. **Identidad visual inmersiva** (narrativa/cinemática).
2. **Forja de símbolos** (texto/imagen).
3. **Flujo de pago Stripe** integrado.
4. **Base Supabase** para autenticación y datos.
5. **SEO técnico** con JSON-LD de `Organization` + `WebSite`.
6. **Entrada de cuenta** con rutas `/login` y `/signup`.

---

## 3) Mapeo con tu blueprint SOT (gap analysis)

Tu blueprint describe una arquitectura tipo Next.js App Router + Prisma + serverless API por dominios (auth/economy/commerce/ai/payments/webhooks). El repo actual no está en ese stack exacto, pero **sí puede alcanzar los mismos objetivos funcionales** con dos caminos:

### Camino A (recomendado corto plazo): mantener stack actual

- Mantener **TanStack Start + Supabase**.
- Implementar APIs por dominio en rutas server existentes.
- Modelar economía/comercio/IA sobre Supabase PostgreSQL.
- Agregar pgvector y búsquedas semánticas en la misma base.

### Camino B (migración total): pasar a Next.js + Prisma

- Replantear routing y server functions a `app/api/*`.
- Mover capa de datos a Prisma (Postgres externo o Supabase Postgres).
- Rehacer middleware/auth y despliegue Vercel orientado a App Router.

**Conclusión técnica:** para velocidad de entrega y menor riesgo, conviene primero consolidar Camino A y solo migrar si hay requerimientos estrictos del ecosistema Next/App Router.

---

## 4) Diseño objetivo SOT (aterrizado a implementación)

## 4.1 Dominios del sistema

1. **Identidad**
   - Registro/login, perfiles, roles, wallet vinculada.
2. **Economía**
   - Ledger de recompensas, débitos, trazabilidad de transacciones.
3. **Comercio**
   - Catálogo, creadores, activos simbólicos premium, checkout.
4. **IA contextual**
   - Recomendación basada en contexto territorial/simbólico.
5. **Pagos**
   - Stripe intents/sessions + webhook firmado + conciliación.
6. **Gobernanza**
   - Reglas de acceso, auditoría, moderación de símbolos/contenido.

## 4.2 Modelo de datos mínimo sugerido

Incluso si no usas Prisma hoy, este esquema funcional debe existir (Supabase SQL o Prisma según camino):

- `users`
- `wallets`
- `transactions`
- `places`
- `commerce`
- `payment_intents`
- `symbols`
- `symbol_lineage`
- `symbol_embeddings` (vector)

---

## 5) Open Symbolic Network (OSN) — propuesta de arquitectura

### 5.1 Capa de ingesta

- Conectores de datasets abiertos (museos, archivos visuales, etnografía pública).
- Scraping controlado con listas blancas, rate limits y respeto de licencias.
- Pipeline de normalización:
  - metadata
  - taxonomía arquetípica
  - trazabilidad de origen

### 5.2 Capa de seguridad y sanitización

- Sanitización SVG robusta (server-side first).
- Eliminación de scripts/event handlers/URLs peligrosas.
- Política CSP estricta y validación de MIME/firmas de archivo.
- Moderación asistida por IA + revisión humana para casos sensibles.

### 5.3 Capa semántica

- Embeddings multimodales (OpenCLIP/SigLIP).
- Almacenamiento vectorial con pgvector.
- Búsqueda híbrida:
  - léxica (BM25/ILIKE/trigram)
  - semántica (vector similarity)
  - filtros taxonómicos/arquetípicos

### 5.4 Capa de generación simbólica

- Forge pipeline multi-etapa:
  1) intent parsing
  2) retrieval simbólico
  3) synthesis procedural
  4) style conditioning
  5) scoring (rareza, coherencia, originalidad)
  6) postproceso + validaciones

### 5.5 Capa experiencial

- Símbolos reactivos (GLSL shaders).
- Audio procedural reactivo.
- Escenas 3D inmersivas (futuro: WebGPU/Three.js).
- Modos de mutación y genealogía simbólica en tiempo real.

---

## 6) Stripe en producción (hardening obligatorio)

Ya que indicas Stripe configurado + webhook secret registrado, los siguientes puntos son críticos para deploy seguro:

1. **Validación de firma webhook** (`Stripe-Signature`) con `constructEvent`.
2. **Idempotencia** por `event.id` (tabla de eventos procesados).
3. **Conciliación** de estado de pago vs orden interna.
4. **No confiar en montos del cliente** (recalcular server-side).
5. **Separar claves por entorno** (test/live) y rotación periódica.

---

## 7) SEO estructurado (rich results)

Se recomienda mantener y ampliar:

- `Organization`
- `WebSite` con `SearchAction`
- opcional según contenido real: `Service`, `Product`, `FAQPage`, `BreadcrumbList`

Buenas prácticas:

- Una sola fuente de verdad por entidad.
- URLs canónicas consistentes.
- Open Graph/Twitter cards por página principal y módulos clave.

---

## 8) Plan de ejecución (Vercel Ready)

### Fase 1 — Stabilize (1–2 semanas)
- Endurecer auth/login/signup.
- Hardening Stripe webhook + auditoría.
- Observabilidad básica (logs, trazas, errores).
- README técnico + runbooks operativos.

### Fase 2 — Economic Core (2–4 semanas)
- Wallet + transaction ledger.
- Endpoints economía/comercio.
- Métricas de conversión y antifraude básico.

### Fase 3 — Symbolic Intelligence (4–8 semanas)
- Ingesta datasets + taxonomía.
- Embeddings + pgvector + búsqueda híbrida.
- Ranking de rarezas y genealogía simbólica.

### Fase 4 — Immersive OS (8+ semanas)
- Motor audiovisual reactivo.
- Simbología viva procedural.
- Experiencia 3D y modos de mutación avanzados.

---

## 9) Variables de entorno sugeridas

```bash
# Core
NODE_ENV=production
APP_URL=https://anubis-legions.lovablle.app

# Supabase
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=...

# Observability (opcional)
SENTRY_DSN=...
LOG_LEVEL=info
```

---

## 10) Comandos de desarrollo

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
```

---

## 11) Riesgos y mitigaciones

1. **Riesgo legal datasets/scraping**
   - Mitigar con licencia explícita + registro de procedencia + takedown process.

2. **Riesgo seguridad SVG/contenido activo**
   - Sanitización en servidor + CSP + aislamiento de render.

3. **Riesgo pagos/fraude**
   - Firma webhook, idempotencia, reconciliación y límites transaccionales.

4. **Riesgo escalado IA-costos**
   - Colas de trabajo, caché semántica y tiering por plan de usuario.

---

## 12) Estado final esperado (visión)

Al completar el roadmap, la plataforma deja de ser un “generador visual” y se convierte en:

- **Sistema Operativo Territorial** para identidad simbólica.
- **Red abierta y trazable** de inteligencia simbólica.
- **Motor económico + creativo** con gobernanza y despliegue global.

---

## 13) Próximo paso recomendado

Si quieres continuar en modo ejecución intensa, el siguiente sprint debería ser:

1. **Hardening producción + seguridad bancaria (Stripe/Supabase).**
2. **Implementación de ledger económico mínimo viable.**
3. **Primera iteración de búsqueda semántica con pgvector.**

Con eso queda la base real para escalar a federación y experiencia inmersiva de nueva generación.
