# Zorro Aventurero — Sumas y Restas

Juego educativo (PWA) para que niños de ~7 años aprendan y practiquen la **suma y
la resta con acarreo**. Basado en el prototipo visual "Zorro Aventurero".

Ver el diseño y el alcance completo en [`ANALISIS.md`](./ANALISIS.md).

## Estado: Fase F0 — Cimientos ✅

App **jugable en local** (suma de 2 cifras con acarreo), sin backend todavía:

- Migración del prototipo a **React 19 + Vite + TypeScript**.
- **Motor de ejercicios** puro y testeable (suma/resta, acarreo configurable,
  determinismo por semilla, detección del tipo de error) — `src/engine/`.
- Sistema de diseño con **tokens OKLCH** y CSS Modules (fuentes Fredoka/Nunito).
- Flujo de 5 pantallas: Inicio → Explicación (CPA) → Práctica → Resultado / Sin vidas.
- La **llevada la teclea el niño** de forma obligatoria y se valida (RF-13).
- **PWA** instalable + offline (service worker con Workbox).
- Progreso (gemas) persistido en `localStorage` (listo para migrar a Supabase en F1).

El backend (Supabase: auth, perfiles de niño, sync) llega en **F1** (ver roadmap §12).

## Stack

React 19 · Vite 6 · TypeScript · Zustand 5 · Vitest · vite-plugin-pwa · pnpm

## Scripts

```bash
pnpm install       # instalar dependencias
pnpm dev           # servidor de desarrollo
pnpm test          # tests del motor y del bucle de juego (Vitest)
pnpm typecheck     # comprobación de tipos
pnpm build         # build de producción (genera el service worker PWA)
pnpm preview       # servir el build
```

## Estructura

```
src/
  engine/     Motor de ejercicios (TS puro) + tests
  store/      Estado del juego (Zustand + persist) + test de integración
  design/     Tokens OKLCH y CSS global
  components/ Fox, Hearts, GemCounter, Numpad
  screens/    Inicio, Explicacion, Practica, Resultado, GameOver
  test/       Setup de tests
```
