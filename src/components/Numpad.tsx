// Teclado numérico en pantalla (RF-12). Botones grandes (≥44px, RNF-03).

import styles from './Numpad.module.css';

interface NumpadProps {
  onDigit: (d: number) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  submitEnabled: boolean;
}

export function Numpad({ onDigit, onBackspace, onSubmit, submitEnabled }: NumpadProps) {
  return (
    <div className={styles.pad}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
        <button
          key={n}
          className={styles.key}
          onClick={() => onDigit(n)}
          aria-label={String(n)}
        >
          {n}
        </button>
      ))}
      <button
        className={styles.keyMuted}
        onClick={onBackspace}
        aria-label="Borrar"
      >
        ⌫
      </button>
      <button className={styles.key} onClick={() => onDigit(0)} aria-label="0">
        0
      </button>
      <button
        className={styles.check}
        onClick={onSubmit}
        disabled={!submitEnabled}
        aria-label="Comprobar"
      >
        ✓
      </button>
    </div>
  );
}
