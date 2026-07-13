// Generador de ejercicios de suma y resta con control de acarreo.
// Núcleo pedagógico, puro y determinista. Referencia: ANALISIS.md §7.

import { createRng, type Rng } from './rng.ts';
import type { CarryMode, Exercise, ExerciseConfig, Operation } from './types.ts';

/** i-ésimo dígito de `n` (índice 0 = unidades). */
function digitAt(n: number, i: number): number {
  return Math.floor(n / 10 ** i) % 10;
}

/** Rango [min, max] por defecto según el nº de cifras. */
function rangeForDigits(digits: 1 | 2 | 3): [number, number] {
  const min = digits === 1 ? 0 : 10 ** (digits - 1);
  const max = 10 ** digits - 1;
  return [min, max];
}

/**
 * Acarreo producido por cada columna en una SUMA.
 * `carries[i] === 1` ⇒ la columna i genera una llevada hacia la i + 1.
 */
export function addCarries(a: number, b: number, cols: number): number[] {
  const carries: number[] = [];
  let carry = 0;
  for (let i = 0; i < cols; i++) {
    const sum = digitAt(a, i) + digitAt(b, i) + carry;
    carry = sum >= 10 ? 1 : 0;
    carries.push(carry);
  }
  return carries;
}

/**
 * Préstamo por cada columna en una RESTA (a ≥ b).
 * `borrows[i] === 1` ⇒ la columna i tuvo que pedir prestado a la i + 1.
 */
export function subBorrows(a: number, b: number, cols: number): number[] {
  const borrows: number[] = [];
  let borrow = 0;
  for (let i = 0; i < cols; i++) {
    const top = digitAt(a, i) - borrow;
    const bottom = digitAt(b, i);
    if (top < bottom) {
      borrow = 1;
    } else {
      borrow = 0;
    }
    borrows.push(borrow);
  }
  return borrows;
}

/** ¿La suma a + b tiene al menos una llevada? */
export function hasCarry(a: number, b: number, cols: number): boolean {
  return addCarries(a, b, cols).some((c) => c === 1);
}

/** ¿La resta a - b requiere pedir prestado al menos una vez? */
export function hasBorrow(a: number, b: number, cols: number): boolean {
  return subBorrows(a, b, cols).some((c) => c === 1);
}

function columnsOf(answer: number, digits: 1 | 2 | 3): Exercise['columns'] {
  const columns: Exercise['columns'] = {
    units: digitAt(answer, 0),
    tens: digitAt(answer, 1),
  };
  if (digits >= 3) columns.hundreds = digitAt(answer, 2);
  return columns;
}

function buildExercise(a: number, b: number, op: 'add' | 'sub', digits: 1 | 2 | 3): Exercise {
  const cols = digits;
  if (op === 'add') {
    const answer = a + b;
    return { a, b, op, answer, columns: columnsOf(answer, digits), carries: addCarries(a, b, cols) };
  }
  const answer = a - b;
  return { a, b, op, answer, columns: columnsOf(answer, digits), carries: subBorrows(a, b, cols) };
}

/** ¿El par (a, b) cumple el modo de acarreo pedido para la operación? */
function satisfiesCarry(a: number, b: number, op: 'add' | 'sub', carry: CarryMode, cols: number): boolean {
  const present = op === 'add' ? hasCarry(a, b, cols) : hasBorrow(a, b, cols);
  if (carry === 'required') return present;
  if (carry === 'none') return !present;
  return true; // 'mixed'
}

function resolveOp(operation: Operation, rng: Rng): 'add' | 'sub' {
  if (operation === 'mixed') return rng.next() < 0.5 ? 'add' : 'sub';
  return operation;
}

/**
 * Genera un ejercicio individual que respeta operación, cifras y modo de acarreo.
 * Usa muestreo por rechazo con un límite de intentos para no bloquear.
 */
function generateOne(config: ExerciseConfig, rng: Rng): Exercise {
  const { digits, carry } = config;
  const [defMin, defMax] = rangeForDigits(digits);
  const min = config.min ?? defMin;
  const max = config.max ?? defMax;
  const op = resolveOp(config.operation, rng);

  const MAX_TRIES = 400;
  for (let t = 0; t < MAX_TRIES; t++) {
    let a = rng.int(min, max);
    let b = rng.int(min, max);
    // La resta nunca da negativo (RF/§7.1): garantizamos a ≥ b.
    if (op === 'sub' && a < b) [a, b] = [b, a];
    if (op === 'sub' && a === b) continue; // evita resultado 0 trivial
    // El resultado de la suma debe caber en el mismo nº de casillas.
    if (op === 'add' && a + b > max) continue;
    if (satisfiesCarry(a, b, op, carry, digits)) {
      return buildExercise(a, b, op, digits);
    }
  }

  // Fallback determinista si el rango hace imposible el criterio: devuelve algo válido.
  const a = op === 'sub' ? max : min;
  const b = op === 'sub' ? min : min;
  return buildExercise(Math.max(a, b), Math.min(a, b), op, digits);
}

/**
 * Genera un set de ejercicios según `config`.
 * - Anti-repetición: no repite el mismo par (a, op, b) dentro del set.
 * - Determinismo: pasar `seed` reproduce exactamente el mismo set.
 */
export function generateExercises(config: ExerciseConfig, seed?: number): Exercise[] {
  const rng = createRng(seed);
  const list: Exercise[] = [];
  const seen = new Set<string>();

  let guard = 0;
  const maxGuard = config.count * 50 + 100;
  while (list.length < config.count && guard < maxGuard) {
    guard++;
    const ex = generateOne(config, rng);
    const key = `${ex.op}:${ex.a}:${ex.b}`;
    if (seen.has(key)) continue;
    seen.add(key);
    list.push(ex);
  }

  // Si el espacio de pares únicos es muy pequeño, completa permitiendo repetición.
  while (list.length < config.count) {
    list.push(generateOne(config, rng));
  }

  return list;
}
