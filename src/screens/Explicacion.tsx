// Lección de suma con acarreo. Sigue el principio CPA (concreto → pictórico →
// abstracto) del ANALISIS.md §4: bloques → decena formada → operación vertical.

import { useGame } from '../store/gameStore.ts';
import { Fox } from '../components/Fox.tsx';
import ui from './ui.module.css';
import styles from './Explicacion.module.css';

function Cube({ color, ghost = false }: { color?: string; ghost?: boolean }) {
  return (
    <span
      className={styles.cube}
      style={
        ghost
          ? { border: '2px dashed rgba(0,0,0,.2)' }
          : { background: color }
      }
    />
  );
}

export function Explicacion() {
  const goInicio = useGame((s) => s.goInicio);
  const startPractice = useGame((s) => s.startPractice);
  const coral = 'var(--c-coral)';
  const teal = 'var(--c-teal)';

  return (
    <div className={ui.screen}>
      <div className={styles.header}>
        <button className={ui.backBtn} onClick={goInicio} aria-label="Volver">
          ‹
        </button>
        <div className={styles.headerTitle}>Sumar llevando</div>
      </div>

      <div className={styles.body}>
        <div className={styles.talk}>
          <Fox size={44} mood="happy" />
          <div className={styles.speech}>
            Cuando sumamos y no cabe en la casilla, ¡formamos una decena nueva!
          </div>
        </div>

        {/* CONCRETO / PICTÓRICO: 8 + 5 con bloques */}
        <div className={styles.concrete}>
          <div className={styles.op}>8 + 5</div>
          <div className={styles.blocksRow}>
            <div className={styles.grid8}>
              {Array.from({ length: 8 }, (_, i) => (
                <Cube key={i} color={coral} />
              ))}
              <Cube ghost />
              <Cube ghost />
            </div>
            <span className={styles.plus}>+</span>
            <div className={styles.row5}>
              {Array.from({ length: 5 }, (_, i) => (
                <Cube key={i} color={teal} />
              ))}
            </div>
          </div>
          <div className={styles.caption}>
            2 se juntan con las 8 → ¡forman una decena completa!
          </div>
          <div className={styles.arrow}>↓</div>
          <div className={styles.blocksRow}>
            <div className={styles.tenBar}>1 decena</div>
            <span className={styles.plus}>+</span>
            <div className={styles.row5}>
              {Array.from({ length: 3 }, (_, i) => (
                <Cube key={i} color={teal} />
              ))}
            </div>
          </div>
          <div className={styles.result}>8 + 5 = 13</div>
        </div>

        {/* ABSTRACTO: operación vertical con la llevada resaltada */}
        <div className={styles.abstract}>
          <div className={styles.abstractTitle}>Ahora con números:</div>
          <div className={styles.vertical}>
            <span className={styles.carryMark}>¹</span>
            <span>2 7</span>
            <span>+ 1 5</span>
            <div className={styles.rule} />
            <span className={styles.answer}>4 2</span>
          </div>
          <div className={styles.caption}>
            «7 + 5 = 12 → pongo el 2 y llevo 1 decena»
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <button className={ui.btnPrimary} onClick={startPractice}>
          Practicar ▸
        </button>
      </div>
    </div>
  );
}
