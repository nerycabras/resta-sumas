import { describe, it, expect } from 'vitest';
import {
  addCarries,
  subBorrows,
  hasCarry,
  hasBorrow,
  generateExercises,
} from './generator.ts';
import type { ExerciseConfig } from './types.ts';

describe('addCarries', () => {
  it('marca la llevada de las unidades en 27 + 15', () => {
    expect(addCarries(27, 15, 2)).toEqual([1, 0]);
  });
  it('sin llevada cuando cada columna suma < 10', () => {
    expect(addCarries(23, 14, 2)).toEqual([0, 0]);
  });
  it('encadena la llevada (55 + 55 = 110)', () => {
    expect(addCarries(55, 55, 3)).toEqual([1, 1, 0]);
  });
});

describe('subBorrows', () => {
  it('marca el préstamo de las unidades en 42 - 17', () => {
    expect(subBorrows(42, 17, 2)).toEqual([1, 0]);
  });
  it('sin préstamo cuando arriba ≥ abajo en cada columna', () => {
    expect(subBorrows(48, 17, 2)).toEqual([0, 0]);
  });
});

describe('hasCarry / hasBorrow', () => {
  it('detecta llevada y préstamo', () => {
    expect(hasCarry(27, 15, 2)).toBe(true);
    expect(hasCarry(23, 14, 2)).toBe(false);
    expect(hasBorrow(42, 17, 2)).toBe(true);
    expect(hasBorrow(48, 17, 2)).toBe(false);
  });
});

const baseAdd: ExerciseConfig = {
  operation: 'add',
  digits: 2,
  carry: 'required',
  count: 5,
};

describe('generateExercises — determinismo', () => {
  it('la misma semilla produce el mismo set', () => {
    const a = generateExercises(baseAdd, 12345);
    const b = generateExercises(baseAdd, 12345);
    expect(a).toEqual(b);
  });
  it('semillas distintas producen sets distintos', () => {
    const a = generateExercises(baseAdd, 1);
    const b = generateExercises(baseAdd, 2);
    expect(a).not.toEqual(b);
  });
  it('genera la cantidad pedida', () => {
    expect(generateExercises({ ...baseAdd, count: 8 }, 7)).toHaveLength(8);
  });
});

describe('generateExercises — reglas de acarreo', () => {
  it('suma required: toda operación tiene llevada y cabe en 2 cifras', () => {
    for (const ex of generateExercises({ ...baseAdd, count: 30 }, 99)) {
      expect(ex.op).toBe('add');
      expect(hasCarry(ex.a, ex.b, 2)).toBe(true);
      expect(ex.a + ex.b).toBe(ex.answer);
      expect(ex.answer).toBeLessThanOrEqual(99);
    }
  });

  it('suma none: ninguna operación tiene llevada', () => {
    const cfg: ExerciseConfig = { ...baseAdd, carry: 'none', count: 30 };
    for (const ex of generateExercises(cfg, 42)) {
      expect(hasCarry(ex.a, ex.b, 2)).toBe(false);
    }
  });

  it('resta required: a ≥ b, hay préstamo y no da negativo', () => {
    const cfg: ExerciseConfig = {
      operation: 'sub',
      digits: 2,
      carry: 'required',
      count: 30,
    };
    for (const ex of generateExercises(cfg, 3)) {
      expect(ex.op).toBe('sub');
      expect(ex.a).toBeGreaterThanOrEqual(ex.b);
      expect(ex.answer).toBeGreaterThanOrEqual(0);
      expect(hasBorrow(ex.a, ex.b, 2)).toBe(true);
    }
  });

  it('mixto: aparecen sumas y restas', () => {
    const cfg: ExerciseConfig = {
      operation: 'mixed',
      digits: 2,
      carry: 'mixed',
      count: 40,
    };
    const ops = new Set(generateExercises(cfg, 5).map((e) => e.op));
    expect(ops.has('add')).toBe(true);
    expect(ops.has('sub')).toBe(true);
  });
});

describe('generateExercises — anti-repetición', () => {
  it('no repite el mismo par (op, a, b) dentro del set', () => {
    const list = generateExercises({ ...baseAdd, count: 10 }, 2024);
    const keys = list.map((e) => `${e.op}:${e.a}:${e.b}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('generateExercises — columnas', () => {
  it('descompone el resultado en unidades y decenas', () => {
    for (const ex of generateExercises(baseAdd, 11)) {
      expect(ex.columns.units).toBe(ex.answer % 10);
      expect(ex.columns.tens).toBe(Math.floor(ex.answer / 10) % 10);
    }
  });
});
