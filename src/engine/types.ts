// Motor de ejercicios — tipos públicos.
// Módulo puro: sin dependencias de React ni del DOM (RNF-08).
// Referencia: ANALISIS.md §7.

export type Operation = 'add' | 'sub' | 'mixed';

/** Modo de acarreo: sin llevar / con llevar (o pedir prestado) / mezcla. */
export type CarryMode = 'none' | 'required' | 'mixed';

export interface ExerciseConfig {
  operation: Operation;
  /** Nº de cifras de los operandos. */
  digits: 1 | 2 | 3;
  carry: CarryMode;
  /** Nº de ejercicios en el set. */
  count: number;
  /** Rango opcional (ambos inclusive). Si se omiten, se derivan de `digits`. */
  min?: number;
  max?: number;
  /** La resta nunca da resultado negativo: siempre a ≥ b. */
  allowNegativeResult?: false;
  /** Envolver en enunciado (no implementado en F0). */
  wordProblems?: boolean;
}

export interface Exercise {
  a: number;
  b: number;
  op: 'add' | 'sub';
  answer: number;
  /** Dígitos del resultado por posición. */
  columns: { units: number; tens: number; hundreds?: number };
  /**
   * Acarreo producido por cada columna, índice 0 = unidades.
   * En suma: 1 si la columna genera una llevada hacia la siguiente.
   * En resta: 1 si la columna necesitó pedir prestado a la siguiente.
   * `carries[i]` es la "llevada" que el niño escribe sobre la columna `i + 1`.
   */
  carries: number[];
  prompt?: string;
}

/** Respuesta que teclea el niño, alineada por columnas (índice 0 = unidades). */
export interface ChildAnswer {
  /** Dígito escrito en cada columna. `null` = casilla vacía. */
  digits: (number | null)[];
  /**
   * Llevada escrita ENTRANDO a cada columna (índice 0 = unidades, siempre 0).
   * `carries[i]` corresponde al acarreo que produjo la columna `i - 1`.
   */
  carries: (number | null)[];
}

export type ErrorType =
  | 'none'
  | 'incomplete'
  | 'carry-forgotten' // olvidó sumar/escribir la llevada
  | 'carry-wrong' // escribió una llevada incorrecta
  | 'borrow-wrong' // se equivocó al pedir prestado
  | 'wrong-digit'; // dígito del resultado incorrecto (genérico)

export interface CheckResult {
  correct: boolean;
  errorType: ErrorType;
  /** true en cada columna cuyo dígito de resultado es incorrecto. */
  columnErrors: boolean[];
}
