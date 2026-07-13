// Pantalla de inicio: mapa de bloques, vidas, gemas y mascota.
// F0 muestra el Bloque 2 (suma) jugable; los demás son de contexto visual.

import { useGame } from '../store/gameStore.ts';
import { Fox } from '../components/Fox.tsx';
import { Hearts } from '../components/Hearts.tsx';
import { GemCounter } from '../components/GemCounter.tsx';
import ui from './ui.module.css';
import styles from './Inicio.module.css';

export function Inicio() {
  const gems = useGame((s) => s.gems);
  const goExplicacion = useGame((s) => s.goExplicacion);

  return (
    <div className={ui.screen}>
      <div className={ui.topbar}>
        <Hearts lives={3} />
        <GemCounter gems={gems} />
      </div>

      <div className={styles.mascot}>
        <Fox size={76} mood="happy" bob />
        <div className={ui.bubble}>¡Hola! Elige un bloque 🦊</div>
      </div>

      <div className={styles.blocks}>
        <div className={`${styles.block} ${styles.done}`}>
          <div className={styles.badge}>1</div>
          <div className={styles.blockText}>
            <div className={styles.blockTitle}>Valor posicional</div>
            <div className={styles.blockSub}>Decenas y unidades</div>
          </div>
          <div className={styles.check}>✓</div>
        </div>

        <button
          className={`${styles.block} ${styles.active}`}
          onClick={goExplicacion}
        >
          <div className={`${styles.badge} ${styles.badgeActive}`}>2</div>
          <div className={styles.blockText}>
            <div className={styles.blockTitle}>Suma con acarreo</div>
            <div className={styles.blockSub}>¡Vamos a practicar!</div>
            <div className={styles.progress}>
              <span style={{ width: '60%' }} />
            </div>
          </div>
        </button>

        <div className={`${styles.block} ${styles.locked}`}>
          <div className={styles.badge}>🔒</div>
          <div className={styles.blockText}>
            <div className={styles.blockTitle}>Resta con acarreo</div>
            <div className={styles.blockSub}>Se abre al terminar el 2</div>
          </div>
        </div>

        <button className={ui.btnGold} onClick={goExplicacion} style={{ marginTop: 'auto' }}>
          Continuar ▸
        </button>
      </div>
    </div>
  );
}
