// Validación de la respuesta del niño, columna a columna, con detección del
// TIPO de error para el diagnóstico pedagógico. Referencia: ANALISIS.md §7.3, §14.

import type { ChildAnswer, CheckResult, ErrorType, Exercise } from './types.ts';

function digitAt(n: number, i: number): number {
  return Math.floor(n / 10 ** i) % 10;
}

/** Llevada esperada ENTRANDO a cada columna (índice 0 = unidades, siempre 0). */
function expectedCarryInto(ex: Exercise): number[] {
  const cols = ex.carries.length;
  const into: number[] = new Array(cols).fill(0);
  for (let i = 1; i < cols; i++) into[i] = ex.carries[i - 1];
  return into;
}

/**
 * Valida la respuesta del niño contra el ejercicio.
 * `given.digits` y `given.carries` van alineados por columna (índice 0 = unidades).
 * La llevada la teclea el niño y también se valida (RF-13).
 */
export function checkAnswer(ex: Exercise, given: ChildAnswer): CheckResult {
  const cols = ex.carries.length;
  const into = expectedCarryInto(ex);

  const columnErrors: boolean[] = [];
  let anyDigitMissing = false;
  for (let i = 0; i < cols; i++) {
    const expected = digitAt(ex.answer, i);
    const got = given.digits[i] ?? null;
    if (got === null) anyDigitMissing = true;
    columnErrors.push(got !== expected);
  }

  // La casilla de llevada que el niño teclea solo se valida al estilo suma
  // (RF-13). En la resta el préstamo es interno y su notación llega en F3.
  const validatesCarry = ex.op === 'add';
  const carryMissing =
    validatesCarry &&
    into.some((e, i) => e === 1 && (given.carries[i] ?? null) === null);

  if (anyDigitMissing) {
    return { correct: false, errorType: 'incomplete', columnErrors };
  }

  const carryMismatch =
    validatesCarry && into.some((e, i) => (given.carries[i] ?? 0) !== e);
  const digitsOk = columnErrors.every((e) => !e);

  if (digitsOk && !carryMismatch) {
    return { correct: true, errorType: 'none', columnErrors };
  }

  const errorType = classifyError(ex, given, into, carryMismatch, carryMissing);
  return { correct: false, errorType, columnErrors };
}

function classifyError(
  ex: Exercise,
  given: ChildAnswer,
  into: number[],
  carryMismatch: boolean,
  carryMissing: boolean,
): ErrorType {
  const cols = ex.carries.length;

  if (ex.op === 'add') {
    // ¿Olvidó sumar la llevada en alguna columna? El dígito coincide con el que
    // saldría de ignorar el acarreo entrante.
    for (let i = 1; i < cols; i++) {
      if (into[i] !== 1) continue;
      const forgotten = (digitAt(ex.a, i) + digitAt(ex.b, i)) % 10;
      const expected = digitAt(ex.answer, i);
      if (given.digits[i] === forgotten && forgotten !== expected) {
        return 'carry-forgotten';
      }
    }
    if (carryMissing) return 'carry-forgotten';
    if (carryMismatch) return 'carry-wrong';
    return 'wrong-digit';
  }

  // Resta: detectar préstamo mal hecho.
  for (let i = 0; i < cols; i++) {
    // Columna que pidió prestado pero el niño restó sin sumar 10.
    if (ex.carries[i] === 1) {
      const naive = (((digitAt(ex.a, i) - digitAt(ex.b, i)) % 10) + 10) % 10;
      const expected = digitAt(ex.answer, i);
      if (given.digits[i] === naive && naive !== expected) return 'borrow-wrong';
    }
    // Columna que prestó pero el niño olvidó descontar 1.
    if (i > 0 && ex.carries[i - 1] === 1) {
      const withoutBorrow = digitAt(ex.a, i) - digitAt(ex.b, i);
      const expected = digitAt(ex.answer, i);
      if (given.digits[i] === withoutBorrow && withoutBorrow !== expected) {
        return 'borrow-wrong';
      }
    }
  }
  if (carryMismatch || carryMissing) return 'borrow-wrong';
  return 'wrong-digit';
}
