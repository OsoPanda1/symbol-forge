# Symbol Forge — Arquitectura de Biomatrix Soberana

## Visión
**Symbol Forge** es una plataforma de generación de sigilos vectoriales con IA orientada a identidad visual soberana. El núcleo operativo es **AlphaForge**, con flujo completo:

1. Entrada al módulo.
2. Generación de candidatos (texto o imagen base).
3. Selección de sigilo.
4. Checkout con Stripe.
5. Liberación del activo final.

## Estado implementado
Esta versión deja operativo y funcional:

- `AlphaForge` con UX inmersiva, modo texto e imagen, validaciones y previsualización local.
- Sanitización de SVG para reducir superficie XSS en render dinámico.
- Estado de sesión de orden (`orderId`, `hash`, `sigils`) conectado a server functions reales.
- Selección persistente de candidato via `selectSigil`.
- Integración de checkout con `createCheckoutSession`.
- Protección de memoria del navegador (revocación de object URLs).
- Señales sonoras de interacción con Web Audio API (degradación segura).

## Arquitectura técnica

### Frontend (React + TanStack Start)
- **Componente principal:** `src/components/AlphaForge.tsx`.
- **Render de video optimizado:** `OptimizedVideo`.
- **Estados clave:** modo de forja, plan, prompt, contacto, imagen, candidatos, selección y checkout.

### Backend (Server Functions)
- `src/lib/forge.functions.ts`
  - `forgeText`
  - `forgeImage`
  - `selectSigil`
- `src/lib/stripe.functions.ts`
  - `createCheckoutSession`

### Persistencia
- Migraciones Supabase en `supabase/migrations/*`.
- Integración cliente/servidor en `src/integrations/supabase/*`.

## Flujo funcional de AlphaForge

### 1) Gate de acceso
El usuario entra al módulo a través de una pantalla inicial de acceso controlado para separar onboarding y ejecución.

### 2) Forja de candidatos
Dos vías:

- **Text-to-sigil**: prompt + contacto.
- **Image-to-sigil**: prompt + contacto + archivo base (hasta 4MB).

El archivo se serializa a Data URL con `FileReader` para enviar al backend.

### 3) Control de seguridad visual y de inyección
`SafeSigilRenderer` aplica filtros defensivos al contenido SVG:

- elimina bloques `<script>`
- elimina atributos `on*`
- neutraliza `javascript:` en `href`

### 4) Selección de candidato
Cada candidato puede activarse y notificarse al backend con `selectSigil`.

### 5) Checkout
Al confirmar, se solicita sesión de Stripe y se redirige a la URL devuelta por backend.

## Recomendaciones de evolución inmediata

1. **Telemetry/Audit opcional:** registrar eventos de UI (forge, select, checkout) para métricas de conversión.
2. **Sanitización reforzada:** sustituir regex por sanitizador robusto de SVG/HTML en servidor y cliente.
3. **Estados de progreso por etapas:** cola, generación, postproceso, listo.
4. **Pruebas unitarias:** cubrir `fileToDataUrl`, selección de sigilo y control de errores de checkout.
5. **E2E:** validar journey completo con mocks de Stripe y Supabase.

## Scripts
- `npm run dev` — entorno local
- `npm run build` — build cliente/SSR
- `npm run preview` — preview
- `npm run lint` — lint

## Nota de diseño
La interfaz usa estética táctica/cinemática, pero conservando un flujo entendible para usuario civil: entrada, creación, elección y pago.
