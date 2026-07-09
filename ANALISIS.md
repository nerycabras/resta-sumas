# Análisis — Juego educativo de Sumas y Restas con acarreo

> App web (PWA) para niños de ~7 años que enseña y ejercita la suma y la resta con
> acarreo. Basada en el prototipo visual "Zorro Aventurero". Documento de análisis
> previo a la construcción.

**Fecha:** 2026-07-08
**Estado:** Análisis / definición (pre-desarrollo)

---

## 1. Decisiones marco (confirmadas)

| Decisión | Elección | Implicación |
|---|---|---|
| Modelo de usuarios | **Cuenta familiar en la nube** | El adulto (padre/madre/tutor) crea una cuenta y da de alta a uno o varios niños. Avances sincronizados entre dispositivos. |
| Stack | **React (Vite) PWA + backend gestionado (Supabase)** | Un solo lenguaje (TS), despliegue rápido, auth + Postgres + realtime incluidos. |
| Alcance | **Todo el temario (Bloques 1–5)** | Se construye completo, pero por **fases** (ver roadmap §12). |
| Base técnica | **Migrar a código estándar** | Se reescribe en React reutilizando el diseño visual de los `.dc.html`. |
| Backend gestionado | **Supabase** | Postgres + Auth + RLS + Realtime. Se descarta Firebase. |
| Entrada del acarreo | **El niño teclea la llevada** | No se autocompleta ni se rellena nada; la casilla de acarreo es un input obligatorio que también se valida. |
| Audio | **Con narración/audio** | Locución de instrucciones y feedback para niños que aún no leen bien. |
| Informes | **Exportables** | El adulto puede exportar el avance del niño (PDF y/o email). |
| Idioma | **Solo español** | UI y audio en español; sin i18n multi-idioma en v1. |

---

## 2. Objetivos

**Objetivo de producto:** que un niño de 7 años aprenda y domine, de forma
autónoma y motivante, la suma y la resta con acarreo, respetando una progresión
de lo concreto a lo abstracto.

**Objetivos medibles (éxito):**
- El niño completa el Bloque 2 (suma con acarreo) con ≥ 80 % de aciertos en práctica independiente.
- Sesiones cortas: duración media por sesión 10–20 min.
- Retención: el niño vuelve ≥ 3 días distintos por semana.
- El adulto puede ver el avance de cada niño en < 3 toques.

**No objetivos (fuera de alcance inicial):**
- Multiplicación / división.
- Modo escuela / multi-aula con roles de maestro (posible fase futura).
- Chat social o interacción entre usuarios.

---

## 3. Usuarios (personas)

| Persona | Necesidad principal | Notas de diseño |
|---|---|---|
| **Niño (7 años)** — usuario final | Jugar, entender, sentirse capaz | Poco texto, iconos grandes, refuerzo positivo, botones ≥ 44 px, lectura mínima. |
| **Adulto (padre/tutor)** — administrador | Crear perfiles, configurar dificultad, ver avances | Panel simple; controla los "controles parentales" y la config pedagógica. |

**Consideración clave (edad):** el niño no gestiona su cuenta. La autenticación
la hace el adulto; el niño solo elige su avatar/nombre y juega. Nada de datos
personales del niño más allá del nombre/apodo y su progreso.

---

## 4. Alcance funcional mapeado al temario

Cada bloque del temario se traduce en módulos de la app:

| Bloque temario | Módulo en la app | Contenido |
|---|---|---|
| **Prerrequisitos** | Diagnóstico inicial (opcional) | Mini-test de conteo, valor posicional y sumas simples para ubicar al niño. |
| **Bloque 1 — Valor posicional** | Módulo "Decenas y unidades" | Agrupar de 10 en 10, representar números con bloques, juego "¿cuántas decenas y unidades?". |
| **Bloque 2 — Suma con acarreo** | Módulo "Sumar llevando" | Concreto (bloques) → dibujos → vertical `27+15` → práctica guiada → independiente. |
| **Bloque 3 — Resta con acarreo** | Módulo "Restar pidiendo prestado" | Concreto (romper decena) → dibujos → vertical `42−17` → práctica guiada → independiente. |
| **Bloque 4 — Consolidación** | Módulo "Mezcla y retos" | Sumas+restas mezcladas, problemas con enunciado (dinero/dulces), 3 cifras (opcional). |
| **Bloque 5 — Evaluación** | Módulo "Prueba final" | 10 ejercicios mixtos + informe de errores comunes y refuerzo dirigido. |

**Principio pedagógico transversal (obligatorio en el diseño):** cada concepto
nuevo pasa por **concreto → pictórico → abstracto** (CPA). No se salta al número
sin antes mostrar bloques/dibujos. Los bloques se **desbloquean en orden** y no
se avanza sin dominar el anterior (ver §9).

---

## 5. Requisitos funcionales (RF)

### 5.1 Cuentas y perfiles
- **RF-01** Registro/login del adulto (email+contraseña; opción magic-link).
- **RF-02** Alta de uno o varios perfiles de niño (nombre/apodo + avatar + edad).
- **RF-03** Selector de perfil al abrir la app ("¿Quién juega hoy?").
- **RF-04** Editar/eliminar perfil de niño (solo el adulto, tras "puerta parental").
- **RF-05** "Puerta parental" (mini-reto: escribir un número/operación) para entrar a ajustes.

### 5.2 Módulo Explicación (enseñar)
- **RF-06** Cada bloque tiene una lección con la mascota (zorro) que explica el concepto.
- **RF-07** Representación **concreta** (bloques de decenas/unidades animados).
- **RF-08** Representación **pictórica** (círculos/palitos) como puente.
- **RF-09** Representación **abstracta** (operación vertical paso a paso, con el "llevo 1" resaltado).
- **RF-10** Botón "Practicar" al final de cada lección.

### 5.3 Módulo Práctica (ejercitar)
- **RF-11** Set de ejercicios **generados aleatoriamente** según configuración (ver §7).
- **RF-12** Entrada por teclado numérico en pantalla; casillas de decenas/unidades (y centenas si aplica).
- **RF-13** Casilla de **acarreo/"llevada"** que el **niño teclea obligatoriamente** (no se autocompleta). Se valida como parte de la respuesta; un acarreo mal puesto cuenta como error y permite detectar el tipo de fallo.
- **RF-13b** **Audio/narración**: locución de la lección, del enunciado y del feedback (acierto/error). Botón de silenciar. Textos siempre acompañados de voz para no lectores.
- **RF-14** Validación inmediata con feedback: acierto (✨ + gemas) / error (shake + reintento).
- **RF-15** Sistema de **vidas** (corazones) y estado "sin vidas".
- **RF-16** Barra de progreso del set y contador "ejercicio N/total".
- **RF-17** Pantalla de resultado: aciertos, gemas ganadas, opción "repasar" o "siguiente".
- **RF-18** Modos: **guiada** (con pistas paso a paso) e **independiente** (sin pistas).

### 5.4 Configuración de complejidad (adulto)
- **RF-19** Elegir operación: suma / resta / mixto.
- **RF-20** Nº de dígitos de los operandos (1, 2, 3).
- **RF-21** Forzar/limitar acarreo (sin acarreo / con acarreo / mixto).
- **RF-22** Rango de números (mín–máx) y nº de ejercicios por set.
- **RF-23** Con o sin problemas de enunciado.
- **RF-24** Presets rápidos por bloque (p. ej. "Bloque 2 fácil").

### 5.5 Progreso y base de datos
- **RF-25** Guardar cada intento (ejercicio, respuesta, correcto/incorrecto, tiempo).
- **RF-26** Guardar avance por bloque/sesión (completado %, sesiones hechas, precisión).
- **RF-27** Gemas y racha (streak) persistentes por perfil de niño.
- **RF-28** Desbloqueo de bloques según dominio del anterior.
- **RF-29** Sincronización en la nube (mismo perfil en varios dispositivos).
- **RF-30** Funcionar **offline** y sincronizar al reconectar (PWA).

### 5.6 Panel del adulto
- **RF-31** Ver por niño: bloques completados, precisión, tiempo, errores frecuentes.
- **RF-32** Ver "errores comunes" detectados (ej. olvida llevar la decena).
- **RF-33** Ajustar la dificultad y el temario visible para cada niño.
- **RF-33b** **Exportar informe** de avance por niño (PDF descargable y/o envío por email): bloques dominados, precisión, errores frecuentes y evolución.

### 5.7 Gamificación
- **RF-34** Gemas por acierto; bonus por set perfecto.
- **RF-35** Rachas diarias.
- **RF-36** Medallas/logros por bloque dominado.
- **RF-37** Personalización del avatar/mascota comprable con gemas (opcional, fase 2).

---

## 6. Requisitos no funcionales (RNF)

- **RNF-01 Responsive:** móvil, tablet y escritorio. Diseño *mobile-first*, layout fluido (el prototipo usa 360×700 fijo → migrar a `min()`/`vh`/`clamp`).
- **RNF-02 PWA:** instalable, offline-first, service worker con caché de assets y cola de sincronización.
- **RNF-03 Accesibilidad infantil:** targets ≥ 44 px, alto contraste, fuentes grandes (Fredoka/Nunito), audio opcional para no lectores, sin texto crítico solo por color.
- **RNF-04 Rendimiento:** carga inicial < 3 s en 4G; animaciones a 60 fps.
- **RNF-05 Idioma:** UI y **audio solo en español** en v1. Textos externalizados igualmente (buena práctica), pero sin soporte multi-idioma.
- **RNF-05b Audio:** narración pregrabada o TTS en español; assets de audio cacheados por el service worker para funcionar offline; respeta el estado "silencio".
- **RNF-06 Privacidad de menores:** mínimos datos del niño (nombre/apodo, no email). Cuenta y consentimiento en el adulto. Cumplir GDPR-K / prácticas COPPA (sin publicidad conductual, sin terceros de tracking).
- **RNF-07 Seguridad:** RLS (Row Level Security) en Supabase; cada adulto solo ve sus perfiles. Auth con tokens; "puerta parental" para ajustes.
- **RNF-08 Mantenibilidad:** TypeScript, componentes reutilizables, motor de ejercicios desacoplado de la UI y **testeable** con tests unitarios.
- **RNF-09 Observabilidad:** logging básico de errores (sin PII del niño).

---

## 7. Motor de generación de ejercicios (núcleo pedagógico)

Componente central, **puro y testeable**, independiente de React.

### 7.1 Parámetros de configuración (`ExerciseConfig`)
```ts
type Operation = 'add' | 'sub' | 'mixed';
type CarryMode = 'none' | 'required' | 'mixed'; // sin acarreo / con acarreo / mixto

interface ExerciseConfig {
  operation: Operation;
  digits: 1 | 2 | 3;        // nº de cifras de los operandos
  carry: CarryMode;         // controla si hay "llevar"/"pedir prestado"
  count: number;            // nº de ejercicios en el set
  min?: number;             // rango opcional
  max?: number;
  allowNegativeResult: false; // resta siempre a ≥ b
  wordProblems?: boolean;   // envolver en enunciado
}
```

### 7.2 Reglas de generación
- **Suma con acarreo (`required`):** garantizar que en al menos una columna la suma de dígitos ≥ 10 (p. ej. unidades `uA+uB ≥ 10`). Resultado dentro del rango de dígitos permitido.
- **Resta con préstamo (`required`):** garantizar `a ≥ b` y que en alguna columna el dígito de arriba < dígito de abajo (obliga a "romper una decena").
- **Sin acarreo (`none`):** cada columna suma < 10 (suma) o `dígitoArriba ≥ dígitoAbajo` (resta).
- **Mixto:** mezcla aleatoria respetando proporción configurable.
- **Anti-repetición:** no repetir el mismo par de operandos dentro del set.
- **Determinismo opcional:** aceptar `seed` para reproducir sets (útil en tests y en "repasar el mismo set").

### 7.3 Salida (`Exercise`)
```ts
interface Exercise {
  a: number; b: number;
  op: 'add' | 'sub';
  answer: number;
  columns: { units: number; tens: number; hundreds?: number };
  carries: number[];        // acarreos por columna (para pistas/validación paso a paso)
  prompt?: string;          // enunciado si wordProblems
}
```

Esto permite validar por columna, mostrar la "llevada" correcta como pista y
detectar el **tipo de error** (ej. sumó bien las unidades pero olvidó la llevada).

---

## 8. Modelo de datos (Supabase / Postgres)

```
adult          (id, email, created_at)                         -- gestionado por Supabase Auth
child          (id, adult_id → adult, name, avatar, birth_year, created_at)
settings       (id, child_id → child, config_json, updated_at)  -- ExerciseConfig por niño/bloque
block          (id, code, title, order_index)                   -- catálogo estático de bloques 1..5
child_progress (id, child_id, block_id, status, accuracy, sessions_done, mastered_at)
session        (id, child_id, block_id, started_at, ended_at, mode, gems_earned)
attempt        (id, session_id, exercise_json, given_answer, is_correct, error_type, ms_taken)
reward         (id, child_id, gems_total, streak_days, last_played_on)
achievement    (id, child_id, code, earned_at)
```

**Seguridad:** RLS por `adult_id`; un adulto solo accede a `child` y datos
derivados que le pertenecen. `block` es catálogo público de solo lectura.

**Offline:** escritura local (IndexedDB) + cola de sincronización que hace
`upsert` a `session`/`attempt`/`reward` al recuperar conexión.

---

## 9. Progresión y desbloqueo

- Bloques secuenciales: 1 → 2 → 3 → 4 → 5. El siguiente se **desbloquea** al
  alcanzar el criterio de dominio del actual.
- **Criterio de dominio (configurable):** p. ej. ≥ 80 % de aciertos en 2 sets de
  práctica independiente del bloque.
- El adulto puede desbloquear manualmente (override) desde el panel.
- "No hay prisa": si baja la precisión, la app sugiere repasar el modo concreto
  del bloque en vez de avanzar.

---

## 10. Mapa de pantallas / navegación

```
Login/Registro (adulto)
  └─ Selector de perfil ("¿Quién juega?")
       └─ Inicio (mapa de bloques, vidas, gemas, mascota)
            ├─ Lección (explicación CPA)  →  Práctica
            ├─ Práctica (config aplicada) →  Resultado / Sin vidas
            ├─ Prueba final (Bloque 5)    →  Informe
            └─ Ajustes (tras puerta parental)
                 └─ Panel del adulto (avances, config de dificultad)
```

El prototipo ya cubre: Inicio, Explicación, Práctica, Resultado y Sin vidas.
Faltan: Login, Selector de perfil, Panel del adulto, Lección concreta (Bloque 1),
módulo de Resta, Consolidación y Prueba final.

---

## 11. Arquitectura técnica

```
Cliente (PWA)
  React + Vite + TypeScript
  Estado: Zustand (o Context) para sesión de juego
  Router: React Router
  UI: componentes propios reutilizando el diseño del prototipo (Fredoka/Nunito, tokens OKLCH)
  Motor de ejercicios: módulo puro TS (sin dependencias de UI) + tests (Vitest)
  Persistencia local/offline: IndexedDB (Dexie) + service worker (Workbox)
        │  HTTPS
        ▼
Backend gestionado (Supabase)
  Auth (email/magic-link)
  Postgres + RLS (modelo §8)
  Realtime opcional (sync multi-dispositivo)
  Storage (avatares, si aplica)
```

**Despliegue:** front en Vercel/Netlify; Supabase gestionado. CI simple con
build + tests del motor de ejercicios.

---

## 12. Roadmap por fases

| Fase | Contenido | Entregable |
|---|---|---|
| **F0 — Cimientos** | Migrar prototipo a React, tokens de diseño, PWA responsive, motor de ejercicios + tests | App jugable local (suma) sin backend |
| **F1 — Cuentas y guardado** | Supabase auth, perfiles de niño, esquema DB, guardado de avances, sync offline | Cuenta familiar funcional |
| **F2 — Bloque 2 completo** | Lección CPA de suma, práctica guiada/independiente, config de dificultad, gamificación | Suma con acarreo end-to-end |
| **F3 — Bloque 3 (Resta)** | Lección "pedir prestado", validación con préstamo, práctica | Resta con acarreo |
| **F4 — Bloque 1 y Panel adulto** | Valor posicional (concreto), panel de avances y config | Prerrequisitos + control parental |
| **F5 — Bloques 4 y 5** | Mixtos, problemas con enunciado, 3 cifras, prueba final e informe de errores | Temario completo |
| **F6 — Pulido** | Logros, personalización con gemas, audio, i18n, accesibilidad final | Versión 1.0 |

---

## 13. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Complejidad de la UI concreta (bloques animados Bloque 1) | Empezar por lo abstracto ya prototipado; el concreto en fase posterior. |
| Sincronización offline con conflictos | Modelo append-only para `attempt`; `reward` con "última escritura gana" por marca de tiempo. |
| Privacidad de menores | Mínimos datos, consentimiento del adulto, sin trackers de terceros. |
| Layout fijo del prototipo (360×700) no responsive | Refactor a unidades fluidas en F0 (regla RNF-01). |
| Sobre-alcance (todo el temario) | Entrega por fases; cada fase es usable de forma independiente. |
| Frustración del niño con errores | Feedback amable, reintentos, sin penalización dura; celebrar el proceso. |

---

## 14. Métricas a instrumentar

- Precisión por bloque y por tipo de operación.
- Tipos de error (olvido de llevada, préstamo mal hecho, columna equivocada).
- Tiempo por ejercicio y por sesión; duración media de sesión.
- Retención (días activos/semana), rachas.
- Progreso de desbloqueo de bloques.

---

## 15. Supuestos y preguntas abiertas

**Supuestos:**
- Un adulto puede tener varios niños; un niño pertenece a un adulto.
- Sin monetización en v1 (sin anuncios, sin compras).

**Decisiones cerradas (antes eran preguntas abiertas):**
1. **Backend: Supabase** (Postgres + Auth + RLS + Realtime). Firebase descartado.
2. **La "llevada" la teclea el niño** de forma obligatoria; no se autocompleta ni se muestra la respuesta (RF-13).
3. **Sí hay audio/narración** en español para no lectores (RF-13b, RNF-05b).
4. **Sí se exportan informes** del adulto en PDF y/o email (RF-33b).
5. **Solo español** en v1; sin multi-idioma (RNF-05).

**Pendientes menores para fase de diseño:**
- Elegir entre audio **pregrabado** (mejor calidad, más assets) o **TTS** (más flexible) — decidir en F2.
- Formato del PDF y si el email se envía vía Supabase Edge Function + proveedor (Resend/SendGrid) — decidir en F4.

---

## 16. Reutilización del prototipo

Del prototipo `Sumas y Restas - Prototipo.dc.html` se conserva:
- Sistema de diseño: paleta OKLCH (coral/dorado/turquesa), tipografías Fredoka + Nunito, mascota zorro, animaciones (bob, pop, shake, heartpop).
- Flujo de pantallas Inicio → Explicación → Práctica → Resultado → Sin vidas.
- Lógica base de generación con acarreo y de validación por decenas/unidades
  (`genExercises`, `checkAnswer`) como punto de partida del motor §7.

Se descarta el runtime Design Composer (`support.js`) en favor de React estándar.
