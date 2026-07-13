// Práctica de suma con acarreo. El niño teclea unidades, la llevada y decenas.
// La llevada es entrada obligatoria y se valida (RF-13). Feedback inmediato
// con ✨/gemas o shake + reintento (RF-14), sistema de vidas (RF-15).

import { useGame, SET_SIZE, type Cell as CellId } from '../store/gameStore.ts';
import { Hearts } from '../components/Hearts.tsx';
import { GemCounter } from '../components/GemCounter.tsx';
import { Numpad } from '../components/Numpad.tsx';
import ui from './ui.module.css';
import styles from './Practica.module.css';

function spaced(n: number): string {
  return String(n).split('').join(' ');
}

interface CellProps {
  id: CellId;
  value: number | null;
  active: boolean;
  wrong: boolean;
  onClick: () => void;
  variant?: 'answer' | 'carry';
}

function Cell({ value, active, wrong, onClick, variant = 'answer' }: CellProps) {
  const cls = [
    variant === 'carry' ? styles.carryCell : styles.answerCell,
    active ? styles.cellActive : '',
    value !== null ? styles.cellFilled : '',
    wrong ? styles.cellWrong : '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button className={cls} onClick={onClick}>
      {value !== null ? value : variant === 'carry' ? '' : '?'}
    </button>
  );
}

export function Practica() {
  const s = useGame();
  const ex = s.exercises[s.idx];
  if (!ex) return null;

  const total = s.exercises.length || SET_SIZE;
  const progressPct = `${Math.round((s.idx / total) * 100)}%`;
  const filled = s.units !== null && s.carry !== null && s.tens !== null;
  const losing = s.feedback === 'wrong' ? s.lives : null;

  const feedbackText =
    s.feedback === 'correct'
      ? '¡Correcto! ✨'
      : s.feedback === 'wrong'
        ? 'Casi... ¡inténtalo otra vez!'
        : '';

  return (
    <div className={ui.screen}>
      <div className={ui.topbar}>
        <Hearts lives={s.lives} size={20} losing={losing} />
        <div className={styles.counter}>
          Ejercicio {s.idx + 1}/{total}
        </div>
        <GemCounter gems={s.gems} size={14} />
      </div>

      <div className={styles.progress}>
        <span style={{ width: progressPct }} />
      </div>

      <div className={styles.stage}>
        <div
          className={styles.operation}
          style={{ animation: s.shake ? 'shake .5s ease-in-out' : undefined }}
        >
          <div className={styles.carryRow}>
            <Cell
              id="carry"
              value={s.carry}
              active={s.active === 'carry'}
              wrong={s.feedback === 'wrong'}
              onClick={() => s.focusCell('carry')}
              variant="carry"
            />
            <span className={styles.carrySlot} />
          </div>
          <div className={styles.operand}>{spaced(ex.a)}</div>
          <div className={styles.operand}>+ {spaced(ex.b)}</div>
          <div className={styles.rule} />
          <div className={styles.answerRow}>
            <Cell
              id="tens"
              value={s.tens}
              active={s.active === 'tens'}
              wrong={s.feedback === 'wrong'}
              onClick={() => s.focusCell('tens')}
            />
            <Cell
              id="units"
              value={s.units}
              active={s.active === 'units'}
              wrong={s.feedback === 'wrong'}
              onClick={() => s.focusCell('units')}
            />
          </div>
        </div>

        {s.feedback && (
          <div
            className={styles.feedback}
            style={{
              color: s.feedback === 'correct' ? 'var(--c-green)' : 'var(--c-red)',
            }}
          >
            {feedbackText}
          </div>
        )}
      </div>

      <Numpad
        onDigit={s.tapDigit}
        onBackspace={s.backspace}
        onSubmit={s.submit}
        submitEnabled={filled && !s.feedback}
      />
    </div>
  );
}
