// Estado "sin vidas": mensaje amable y reintento, sin penalización dura
// (RF-15, riesgo "frustración del niño" del ANALISIS.md §13).

import { useGame } from '../store/gameStore.ts';
import { Fox } from '../components/Fox.tsx';
import ui from './ui.module.css';
import styles from './GameOver.module.css';

export function GameOver() {
  const retry = useGame((s) => s.retry);

  return (
    <div className={`${ui.screen} ${styles.over}`}>
      <div className={styles.fox}>
        <Fox size={96} mood="sad" />
      </div>
      <div className={styles.title}>¡Sin vidas!</div>
      <div className={styles.msg}>No te preocupes, inténtalo otra vez 🦊</div>

      <div className={styles.actions}>
        <button className={ui.btnPrimary} onClick={retry}>
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
