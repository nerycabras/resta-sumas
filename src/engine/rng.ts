// Generador de números pseudoaleatorios con semilla (mulberry32).
// Determinista: la misma semilla produce la misma secuencia, útil para tests
// y para "repasar el mismo set" (ANALISIS.md §7.2).

export interface Rng {
  /** Float en [0, 1). */
  next(): number;
  /** Entero en [min, max] (ambos inclusive). */
  int(min: number, max: number): number;
  /** Elemento aleatorio de un array no vacío. */
  pick<T>(items: readonly T[]): T;
}

export function createRng(seed?: number): Rng {
  // Si no hay semilla, usa uno aleatorio para que cada partida difiera.
  let state =
    (seed ?? Math.floor(Math.random() * 0xffffffff)) >>> 0;

  const next = (): number => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const int = (min: number, max: number): number =>
    min + Math.floor(next() * (max - min + 1));

  const pick = <T,>(items: readonly T[]): T =>
    items[int(0, items.length - 1)];

  return { next, int, pick };
}
