import { describe, it, expect } from 'vitest';
import { checkAnswer } from './validator.ts';
import type { Exercise } from './types.ts';

// 27 + 15 = 42, con llevada en las unidades.
const add2715: Exercise = {
  a: 27,
  b: 15,
  op: 'add',
  answer: 42,
  columns: { units: 2, tens: 4 },
  carries: [1, 0],
};

// 42 - 17 = 25, con préstamo en las unidades.
const sub4217: Exercise = {
  a: 42,
  b: 17,
  op: 'sub',
  answer: 25,
  columns: { units: 5, tens: 2 },
  carries: [1, 0],
};

describe('checkAnswer — suma', () => {
  it('acepta la respuesta correcta con la llevada bien puesta', () => {
    const r = checkAnswer(add2715, { digits: [2, 4], carries: [0, 1] });
    expect(r).toEqual({ correct: true, errorType: 'none', columnErrors: [false, false] });
  });

  it('marca incompleto si falta un dígito', () => {
    const r = checkAnswer(add2715, { digits: [2, null], carries: [0, 1] });
    expect(r.correct).toBe(false);
    expect(r.errorType).toBe('incomplete');
  });

  it('detecta que olvidó la llevada (pone 32 en vez de 42)', () => {
    // decenas = 2 + 1 = 3 (sin sumar la llevada), unidades correctas.
    const r = checkAnswer(add2715, { digits: [2, 3], carries: [0, null] });
    expect(r.correct).toBe(false);
    expect(r.errorType).toBe('carry-forgotten');
    expect(r.columnErrors).toEqual([false, true]);
  });

  it('detecta llevada mal escrita aunque los dígitos cuadren', () => {
    const r = checkAnswer(add2715, { digits: [2, 4], carries: [0, 0] });
    expect(r.correct).toBe(false);
    expect(r.errorType).toBe('carry-wrong');
  });

  it('marca dígito erróneo genérico', () => {
    const r = checkAnswer(add2715, { digits: [9, 4], carries: [0, 1] });
    expect(r.correct).toBe(false);
    expect(r.errorType).toBe('wrong-digit');
    expect(r.columnErrors).toEqual([true, false]);
  });
});

describe('checkAnswer — resta', () => {
  it('acepta la respuesta correcta', () => {
    const r = checkAnswer(sub4217, { digits: [5, 2], carries: [0, 0] });
    expect(r.correct).toBe(true);
    expect(r.errorType).toBe('none');
  });

  it('detecta que olvidó descontar 1 en las decenas (pone 35 en vez de 25)', () => {
    // Fallo típico de préstamo: unidades bien (12-7=5) pero decenas sin restar
    // la que se prestó → 4-1 = 3 en lugar de 3-1 = 2.
    const r = checkAnswer(sub4217, { digits: [5, 3], carries: [0, 0] });
    expect(r.correct).toBe(false);
    expect(r.errorType).toBe('borrow-wrong');
    expect(r.columnErrors).toEqual([false, true]);
  });
});
