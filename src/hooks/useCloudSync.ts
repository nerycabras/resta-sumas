// Puente entre el store de juego (puro) y Supabase:
//  - al seleccionar niño: carga sus gemas y reinicia el juego en Inicio.
//  - al terminar un set (resultado o sin vidas): guarda sesión + intentos +
//    recompensa + avance del bloque.
import { useEffect } from 'react';
import { useGame } from '../store/gameStore.ts';
import { useChild } from '../store/childStore.ts';
import { loadChildGems, saveSessionResult } from '../data/progress.ts';

const BLOCK_CODE = 'suma-acarreo'; // F1 Paso 1: solo Bloque 2

export function useCloudSync() {
  const childId = useChild((s) => s.child?.id ?? null);

  // Cargar gemas del niño y arrancar en Inicio.
  useEffect(() => {
    if (!childId) return;
    let cancelled = false;
    useGame.setState({ screen: 'inicio' });
    loadChildGems(childId)
      .then((gems) => {
        if (!cancelled) useGame.getState().hydrate({ childId, gems });
      })
      .catch((e) => console.error('No se pudieron cargar las gemas:', e));
    return () => {
      cancelled = true;
    };
  }, [childId]);

  // Persistir al completar un set (o quedarse sin vidas).
  useEffect(() => {
    const unsub = useGame.subscribe((state, prev) => {
      const justFinished =
        (state.screen === 'resultado' || state.screen === 'gameover') &&
        prev.screen === 'practica';
      if (!justFinished) return;

      const s = useGame.getState();
      if (!s.childId) return;

      saveSessionResult({
        childId: s.childId,
        blockCode: BLOCK_CODE,
        mode: 'independent',
        gemsEarned: s.gemsEarned,
        gemsTotal: s.gems,
        attempts: s.attemptsLog,
        correctCount: s.correctCount,
        total: s.attemptsLog.length,
      }).catch((e) => console.error('No se pudo guardar la sesión:', e));
    });
    return unsub;
  }, []);
}
