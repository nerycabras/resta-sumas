// Estado de la sesión de juego (Zustand). Puro y síncrono (testeable): no habla
// con la red. La fuente de verdad de las gemas es la nube; el hook useCloudSync
// hidrata el store al entrar y persiste al terminar un set. La caché offline
// por-niño llega en F1 Paso 2.
//
// F1 Paso 1: solo suma de 2 cifras con acarreo (Bloque 2). El niño teclea
// unidades, la llevada y decenas; la llevada es obligatoria y se valida (RF-13).

import { create } from 'zustand';
import { generateExercises } from '../engine/generator.ts';
import { checkAnswer } from '../engine/validator.ts';
import type { Exercise } from '../engine/types.ts';

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

/** Un intento registrado para guardarlo en la nube (§8 attempt). */
export interface AttemptLog {
  exercise: Exercise;
  given: { digits: (number | null)[]; carries: (number | null)[] };
  isCorrect: boolean;
  errorType: string;
  msTaken: number;
}

interface SessionInput {
  units: number | null;
  carry: number | null;
  tens: number | null;
  active: Cell;
  feedback: Feedback;
  shake: boolean;
}

interface GameState extends SessionInput {
  // ---- Niño y progreso ----
  childId: string | null;
  gems: number;

  // ---- Sesión (efímera) ----
  screen: Screen;
  lives: number;
  exercises: Exercise[];
  idx: number;
  correctCount: number;
  gemsEarned: number;
  attemptsLog: AttemptLog[];
  exerciseShownAt: number;

  // ---- Navegación ----
  hydrate: (input: { childId: string; gems: number }) => void;
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
  attemptsLog: [] as AttemptLog[],
  exerciseShownAt: Date.now(),
  ...clearedInput(),
});

export const useGame = create<GameState>()((set, get) => ({
  childId: null,
  gems: 0,

      screen: 'inicio',
      lives: START_LIVES,
      exercises: [],
      idx: 0,
      correctCount: 0,
      gemsEarned: 0,
      attemptsLog: [],
      exerciseShownAt: 0,
      ...clearedInput(),

      hydrate: ({ childId, gems }) => set({ childId, gems }),
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
        const given = { digits: [s.units, s.tens], carries: [0, s.carry] };
        const result = checkAnswer(ex, given);

        const attempt: AttemptLog = {
          exercise: ex,
          given,
          isCorrect: result.correct,
          errorType: result.errorType,
          msTaken: Math.max(0, Date.now() - s.exerciseShownAt),
        };
        const attemptsLog = [...s.attemptsLog, attempt];

        if (result.correct) {
          set({
            attemptsLog,
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
              set({ idx: next, exerciseShownAt: Date.now(), ...clearedInput() });
            }
          }, FEEDBACK_MS_OK);
        } else {
          const newLives = s.lives - 1;
          set({ attemptsLog, feedback: 'wrong', lives: newLives, shake: true });
          setTimeout(() => {
            if (get().lives <= 0) {
              set({ screen: 'gameover', shake: false });
            } else {
              set({ exerciseShownAt: Date.now(), ...clearedInput() });
            }
          }, FEEDBACK_MS_WRONG);
        }
      },
}));
