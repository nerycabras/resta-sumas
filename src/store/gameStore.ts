// Estado de la sesión de juego (Zustand).
// El progreso persistente (gemas) va a localStorage vía `persist`; en F1 esta
// misma capa se conectará a Supabase/Dexie sin tocar la UI.
//
// F0: solo suma de 2 cifras con acarreo (Bloque 2). El niño teclea unidades,
// la llevada y decenas; la llevada es entrada obligatoria y se valida (RF-13).

import { create } from 'zustand';
import { persist, type PersistStorage } from 'zustand/middleware';
import { generateExercises } from '../engine/generator.ts';
import { checkAnswer } from '../engine/validator.ts';
import type { Exercise } from '../engine/types.ts';

/** Solo persistimos el progreso. */
type Persisted = Pick<GameState, 'gems'>;

// Storage tolerante: resuelve localStorage en cada llamada, así que si no está
// disponible (tests en node, SSR, modo privado…) la persistencia no actúa en
// vez de romper. Evita el problema de "storage capturado una sola vez".
const safeStorage: PersistStorage<Persisted> = {
  getItem: (name) => {
    try {
      const raw = globalThis.localStorage?.getItem(name);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      globalThis.localStorage?.setItem(name, JSON.stringify(value));
    } catch {
      /* sin persistencia disponible */
    }
  },
  removeItem: (name) => {
    try {
      globalThis.localStorage?.removeItem(name);
    } catch {
      /* sin persistencia disponible */
    }
  },
};

export const SET_SIZE = 5;
export const START_LIVES = 3;
const GEMS_PER_CORRECT = 2;
const FEEDBACK_MS_OK = 900;
const FEEDBACK_MS_WRONG = 850;

export type Screen =
  | 'inicio'
  | 'explicacion'
  | 'practica'
  | 'resultado'
  | 'gameover';

/** Casillas que el niño rellena, en el orden pedagógico de resolución. */
export type Cell = 'units' | 'carry' | 'tens';

export type Feedback = 'correct' | 'wrong' | null;

interface SessionInput {
  units: number | null;
  carry: number | null;
  tens: number | null;
  active: Cell;
  feedback: Feedback;
  shake: boolean;
}

interface GameState extends SessionInput {
  // ---- Progreso persistente ----
  gems: number;

  // ---- Sesión (efímera) ----
  screen: Screen;
  lives: number;
  exercises: Exercise[];
  idx: number;
  correctCount: number;
  gemsEarned: number;

  // ---- Navegación ----
  goInicio: () => void;
  goExplicacion: () => void;
  startPractice: () => void;
  retry: () => void;
  repasar: () => void;

  // ---- Entrada del ejercicio ----
  focusCell: (cell: Cell) => void;
  tapDigit: (digit: number) => void;
  backspace: () => void;
  submit: () => void;
}

const clearedInput = (): SessionInput => ({
  units: null,
  carry: null,
  tens: null,
  active: 'units',
  feedback: null,
  shake: false,
});

/** Config de práctica de F0: Bloque 2 — suma de 2 cifras con acarreo. */
const newSet = (): Exercise[] =>
  generateExercises({
    operation: 'add',
    digits: 2,
    carry: 'required',
    count: SET_SIZE,
  });

const freshSession = () => ({
  lives: START_LIVES,
  exercises: newSet(),
  idx: 0,
  correctCount: 0,
  gemsEarned: 0,
  ...clearedInput(),
});

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      gems: 24,

      screen: 'inicio',
      lives: START_LIVES,
      exercises: [],
      idx: 0,
      correctCount: 0,
      gemsEarned: 0,
      ...clearedInput(),

      goInicio: () => set({ screen: 'inicio' }),
      goExplicacion: () => set({ screen: 'explicacion' }),

      startPractice: () => set({ screen: 'practica', ...freshSession() }),
      retry: () => set({ screen: 'practica', ...freshSession() }),
      repasar: () => set({ screen: 'practica', ...freshSession() }),

      focusCell: (cell) => {
        if (get().feedback) return;
        set({ active: cell });
      },

      tapDigit: (digit) => {
        const s = get();
        if (s.feedback) return;
        if (s.active === 'units') set({ units: digit, active: 'carry' });
        else if (s.active === 'carry') set({ carry: digit, active: 'tens' });
        else set({ tens: digit });
      },

      backspace: () => {
        const s = get();
        if (s.feedback) return;
        if (s.active === 'tens') {
          if (s.tens !== null) set({ tens: null });
          else set({ active: 'carry' });
        } else if (s.active === 'carry') {
          if (s.carry !== null) set({ carry: null });
          else set({ active: 'units' });
        } else if (s.units !== null) {
          set({ units: null });
        }
      },

      submit: () => {
        const s = get();
        if (s.feedback) return;
        if (s.units === null || s.carry === null || s.tens === null) return;

        const ex = s.exercises[s.idx];
        const result = checkAnswer(ex, {
          digits: [s.units, s.tens],
          carries: [0, s.carry],
        });

        if (result.correct) {
          set({
            feedback: 'correct',
            gems: s.gems + GEMS_PER_CORRECT,
            gemsEarned: s.gemsEarned + GEMS_PER_CORRECT,
            correctCount: s.correctCount + 1,
          });
          setTimeout(() => {
            const st = get();
            const next = st.idx + 1;
            if (next >= st.exercises.length) {
              set({ screen: 'resultado' });
            } else {
              set({ idx: next, ...clearedInput() });
            }
          }, FEEDBACK_MS_OK);
        } else {
          const newLives = s.lives - 1;
          set({ feedback: 'wrong', lives: newLives, shake: true });
          setTimeout(() => {
            if (get().lives <= 0) {
              set({ screen: 'gameover', shake: false });
            } else {
              set({ ...clearedInput() });
            }
          }, FEEDBACK_MS_WRONG);
        }
      },
    }),
    {
      name: 'zorro-progreso',
      storage: safeStorage,
      // Solo el progreso persiste; el estado de la sesión es efímero.
      partialize: (s): Persisted => ({ gems: s.gems }),
    },
  ),
);
