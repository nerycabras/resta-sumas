// Shell del juego: conmuta entre las pantallas según el estado del store.
import { useGame } from './store/gameStore.ts';
import { useCloudSync } from './hooks/useCloudSync.ts';
import { Inicio } from './screens/Inicio.tsx';
import { Explicacion } from './screens/Explicacion.tsx';
import { Practica } from './screens/Practica.tsx';
import { Resultado } from './screens/Resultado.tsx';
import { GameOver } from './screens/GameOver.tsx';

export function Game() {
  useCloudSync();
  const screen = useGame((s) => s.screen);
  return (
    <>
      {screen === 'inicio' && <Inicio />}
      {screen === 'explicacion' && <Explicacion />}
      {screen === 'practica' && <Practica />}
      {screen === 'resultado' && <Resultado />}
      {screen === 'gameover' && <GameOver />}
    </>
  );
}
