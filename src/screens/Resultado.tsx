// Pantalla de resultado del set: aciertos, gemas ganadas y opciones de
// repasar o continuar (RF-17).

import { useGame } from '../store/gameStore.ts';
import { Fox } from '../components/Fox.tsx';
import { Hearts } from '../components/Hearts.tsx';
import ui from './ui.module.css';
import styles from './Resultado.module.css';

export function Resultado() {
  const correctCount = useGame((s) => s.correctCount);
  const total = useGame((s) => s.exercises.length);
  const gemsEarned = useGame((s) => s.gemsEarned);
  const lives = useGame((s) => s.lives);
  const goInicio = useGame((s) => s.goInicio);
  const repasar = useGame((s) => s.repasar);

  return (
    <div className={`${ui.screen} ${styles.win}`}>
      <div className={styles.fox}>
        <Fox size={96} mood="happy" />
      </div>
      <div className={styles.title}>¡Muy bien!</div>
      <div className={styles.sub}>
        {correctCount} de {total} correctas
      </div>

      <div className={styles.gemCard}>
        <span className={styles.gem} />
        <span className={styles.gemText}>+{gemsEarned} gemas</span>
      </div>

      <div className={styles.hearts}>
        <Hearts lives={lives} />
      </div>

      <div className={styles.actions}>
        <button className={ui.btnPrimary} onClick={goInicio}>
          Siguiente ▸
        </button>
        <button className={ui.btnSecondary} onClick={repasar}>
          Repasar este bloque
        </button>
      </div>
    </div>
  );
}
