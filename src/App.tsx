import { useGame } from './store/gameStore.ts';
import { Inicio } from './screens/Inicio.tsx';
import { Explicacion } from './screens/Explicacion.tsx';
import { Practica } from './screens/Practica.tsx';
import { Resultado } from './screens/Resultado.tsx';
import { GameOver } from './screens/GameOver.tsx';
import styles from './App.module.css';

export default function App() {
  const screen = useGame((s) => s.screen);

  return (
    <div className={styles.stage}>
      <main className={styles.frame}>
        {screen === 'inicio' && <Inicio />}
        {screen === 'explicacion' && <Explicacion />}
        {screen === 'practica' && <Practica />}
        {screen === 'resultado' && <Resultado />}
        {screen === 'gameover' && <GameOver />}
      </main>
    </div>
  );
}
