// Test de integración del bucle de juego: verifica que generador + validador +
// store encajan y que un set se puede jugar de principio a fin.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGame, START_LIVES } from './gameStore.ts';
import type { Exercise } from '../engine/types.ts';

/** Rellena las casillas con la respuesta correcta del ejercicio actual. */
function fillCorrect(ex: Exercise) {
  useGame.setState({
    units: ex.columns.units,
    tens: ex.columns.tens,
    carry: ex.carries[0],
  });
}

beforeEach(() => {
  vi.useRealTimers();
  useGame.setState({ gems: 24, screen: 'inicio' });
});

describe('bucle de juego', () => {
  it('un set perfecto llega a resultado y suma 2 gemas por acierto', () => {
    vi.useFakeTimers();
    useGame.getState().startPractice();
    expect(useGame.getState().screen).toBe('practica');

    const total = useGame.getState().exercises.length;
    const gems0 = useGame.getState().gems;

    for (let i = 0; i < total; i++) {
      const st = useGame.getState();
      fillCorrect(st.exercises[st.idx]);
      useGame.getState().submit();
      vi.advanceTimersByTime(1000);
    }

    const end = useGame.getState();
    expect(end.screen).toBe('resultado');
    expect(end.correctCount).toBe(total);
    expect(end.gems).toBe(gems0 + total * 2);
    vi.useRealTimers();
  });

  it('una respuesta incorrecta resta una vida', () => {
    vi.useFakeTimers();
    useGame.getState().startPractice();
    const ex = useGame.getState().exercises[0];

    // Respuesta con la unidad cambiada → incorrecta.
    useGame.setState({
      units: (ex.columns.units + 1) % 10,
      tens: ex.columns.tens,
      carry: ex.carries[0],
    });
    useGame.getState().submit();
    expect(useGame.getState().feedback).toBe('wrong');

    vi.advanceTimersByTime(1000);
    expect(useGame.getState().lives).toBe(START_LIVES - 1);
    expect(useGame.getState().screen).toBe('practica');
    vi.useRealTimers();
  });

  it('fallar tres veces lleva a sin vidas', () => {
    vi.useFakeTimers();
    useGame.getState().startPractice();

    for (let i = 0; i < START_LIVES; i++) {
      const ex = useGame.getState().exercises[useGame.getState().idx];
      useGame.setState({
        units: (ex.columns.units + 1) % 10,
        tens: ex.columns.tens,
        carry: ex.carries[0],
      });
      useGame.getState().submit();
      vi.advanceTimersByTime(1000);
    }

    expect(useGame.getState().screen).toBe('gameover');
    vi.useRealTimers();
  });

  it('la llevada sin teclear impide comprobar', () => {
    useGame.getState().startPractice();
    const ex = useGame.getState().exercises[0];
    // Sin carry: submit no debe avanzar ni dar feedback.
    useGame.setState({ units: ex.columns.units, tens: ex.columns.tens, carry: null });
    useGame.getState().submit();
    expect(useGame.getState().feedback).toBeNull();
  });
});
