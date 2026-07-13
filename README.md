# Zorro Aventurero — Sumas y Restas

Juego educativo (PWA) para que niños de ~7 años aprendan y practiquen la **suma y
la resta con acarreo**. Basado en el prototipo visual "Zorro Aventurero".

Ver el diseño y el alcance completo en [`ANALISIS.md`](./ANALISIS.md).

## Estado

### F0 — Cimientos ✅
- Migración del prototipo a **React 19 + Vite + TypeScript**.
- **Motor de ejercicios** puro y testeable (suma/resta, acarreo configurable,
  determinismo por semilla, detección del tipo de error) — `src/engine/`.
- Sistema de diseño con **tokens OKLCH** y CSS Modules (fuentes Fredoka/Nunito).
- Flujo de juego: Inicio → Explicación (CPA) → Práctica → Resultado / Sin vidas.
- La **llevada la teclea el niño** de forma obligatoria y se valida (RF-13).
- **PWA** instalable + offline (service worker con Workbox).

### F1 · Paso 1 — Cuentas y guardado (online) ✅
- **Supabase** (Auth + Postgres + RLS) — local vía CLI/Docker.
- Esquema de datos §8 con **RLS por adulto** (`supabase/migrations/`).
- **Registro/login del adulto** (email + contraseña) — `src/auth/`.
- **Perfiles de niño**: alta, selector "¿Quién juega hoy?", edición y borrado
  tras **puerta parental** (RF-02/04/05).
- **Guardado en la nube** del progreso por niño: gemas, racha, sesiones,
  intentos (con tiempo y tipo de error) y avance por bloque.

> **Pendiente F1 · Paso 2:** sincronización offline (IndexedDB/Dexie + cola).

## Stack

React 19 · Vite 6 · TypeScript · Zustand 5 · React Router · Supabase · Vitest ·
vite-plugin-pwa · pnpm

## Puesta en marcha

```bash
pnpm install

# 1) Backend local (necesita Docker). Aplica las migraciones y arranca Postgres+Auth.
pnpm exec supabase start

# 2) Variables de entorno: copia la plantilla y pega la ANON KEY que muestra:
pnpm exec supabase status          # copia ANON_KEY
cp .env.example .env.local         # y pega VITE_SUPABASE_ANON_KEY

# 3) App
pnpm dev
```

Supabase Studio (ver la BD): http://127.0.0.1:54323 · Emails de prueba (Mailpit):
http://127.0.0.1:54324

## Scripts

```bash
pnpm dev           # servidor de desarrollo
pnpm test          # tests del motor y del bucle de juego (Vitest)
pnpm typecheck     # comprobación de tipos
pnpm build         # build de producción (genera el service worker PWA)
pnpm preview       # servir el build

pnpm exec supabase start|stop|status
pnpm exec supabase db reset        # recrea la BD y reaplica migraciones
pnpm exec supabase gen types typescript --local > src/lib/database.types.ts
```

## Estructura

```
src/
  engine/     Motor de ejercicios (TS puro) + tests
  store/      Estado del juego y del niño (Zustand) + test de integración
  auth/       Contexto de sesión del adulto (Supabase Auth)
  data/       Acceso a datos (children, progress)
  lib/        Cliente Supabase y tipos de la BD
  hooks/      useCloudSync (puente store ↔ nube)
  design/     Tokens OKLCH y CSS global
  components/ Fox, Hearts, GemCounter, Numpad, PhoneFrame, ParentalGate
  screens/    Login, ProfileSelect, Inicio, Explicacion, Practica, Resultado, GameOver
supabase/
  migrations/ Esquema + RLS
  config.toml Configuración del stack local
```
