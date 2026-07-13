// Puerta parental (RF-05): un mini-reto de cálculo para impedir que el niño
// acceda a la gestión de perfiles/ajustes.
import { useMemo, useState } from 'react';
import ui from '../screens/ui.module.css';
import styles from './ParentalGate.module.css';

export function ParentalGate({
  onPass,
  onCancel,
}: {
  onPass: () => void;
  onCancel: () => void;
}) {
  const { a, b } = useMemo(
    () => ({ a: 6 + Math.floor(Math.random() * 7), b: 5 + Math.floor(Math.random() * 8) }),
    [],
  );
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  const check = () => {
    if (Number(value) === a + b) onPass();
    else {
      setError(true);
      setValue('');
    }
  };

  return (
    <div className={styles.backdrop} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.title}>Solo para adultos</div>
        <div className={styles.sub}>
          Resuelve para continuar: <strong>{a} + {b}</strong>
        </div>
        <input
          className={styles.input}
          type="number"
          inputMode="numeric"
          autoFocus
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(false);
          }}
          onKeyDown={(e) => e.key === 'Enter' && check()}
        />
        {error && <div className={styles.error}>No es correcto, prueba otra vez.</div>}
        <div className={styles.actions}>
          <button className={ui.btnSecondary} onClick={onCancel}>
            Cancelar
          </button>
          <button className={ui.btnPrimary} onClick={check}>
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
}
