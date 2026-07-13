// Guardado del progreso en Supabase: recompensas (gemas/racha), sesiones,
// intentos y avance por bloque. Modelo del ANALISIS.md §8.
import { supabase } from '../lib/supabase.ts';
import type { Json } from '../lib/database.types.ts';
import type { AttemptLog } from '../store/gameStore.ts';

/** Fecha local en formato YYYY-MM-DD (para la racha diaria). */
function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

/** Días de diferencia entre dos fechas YYYY-MM-DD (b - a). */
function daysBetween(a: string, b: string): number {
  const ms = Date.parse(`${b}T00:00:00`) - Date.parse(`${a}T00:00:00`);
  return Math.round(ms / 86_400_000);
}

/**
 * Gemas acumuladas del niño; garantiza la fila de recompensa de forma
 * idempotente. Usa upsert con `ignoreDuplicates` (no pisa las gemas
 * existentes) para ser seguro ante llamadas concurrentes —p. ej. el doble
 * montaje de efectos de React en StrictMode.
 */
export async function loadChildGems(childId: string): Promise<number> {
  const { error: upErr } = await supabase
    .from('reward')
    .upsert(
      { child_id: childId, gems_total: 0 },
      { onConflict: 'child_id', ignoreDuplicates: true },
    );
  if (upErr) throw upErr;

  const { data, error } = await supabase
    .from('reward')
    .select('gems_total')
    .eq('child_id', childId)
    .single();
  if (error) throw error;
  return data.gems_total;
}

async function blockIdByCode(code: string): Promise<string | null> {
  const { data } = await supabase
    .from('block')
    .select('id')
    .eq('code', code)
    .maybeSingle();
  return data?.id ?? null;
}

async function updateStreakAndReward(childId: string, gemsTotal: number) {
  const { data: prev } = await supabase
    .from('reward')
    .select('streak_days, last_played_on')
    .eq('child_id', childId)
    .maybeSingle();

  const t = today();
  let streak = 1;
  if (prev?.last_played_on) {
    const diff = daysBetween(prev.last_played_on, t);
    if (diff === 0) streak = prev.streak_days || 1; // ya jugó hoy
    else if (diff === 1) streak = (prev.streak_days || 0) + 1; // día seguido
    else streak = 1; // se rompió la racha
  }

  await supabase.from('reward').upsert({
    child_id: childId,
    gems_total: gemsTotal,
    streak_days: streak,
    last_played_on: t,
    updated_at: new Date().toISOString(),
  });
}

async function bumpBlockProgress(
  childId: string,
  blockId: string,
  accuracy: number,
) {
  const { data: prev } = await supabase
    .from('child_progress')
    .select('sessions_done')
    .eq('child_id', childId)
    .eq('block_id', blockId)
    .maybeSingle();

  await supabase.from('child_progress').upsert(
    {
      child_id: childId,
      block_id: blockId,
      status: 'in_progress',
      accuracy,
      sessions_done: (prev?.sessions_done ?? 0) + 1,
    },
    { onConflict: 'child_id,block_id' },
  );
}

/**
 * Persiste el resultado de un set jugado: sesión + intentos + recompensa +
 * avance del bloque. Best-effort: los errores se propagan para que el llamador
 * decida (en el Paso 2 se encolarán para reintento offline).
 */
export async function saveSessionResult(input: {
  childId: string;
  blockCode: string;
  mode: 'guided' | 'independent';
  gemsEarned: number;
  gemsTotal: number;
  attempts: AttemptLog[];
  correctCount: number;
  total: number;
}): Promise<void> {
  const blockId = await blockIdByCode(input.blockCode);

  const { data: session, error: sesErr } = await supabase
    .from('session')
    .insert({
      child_id: input.childId,
      block_id: blockId,
      mode: input.mode,
      gems_earned: input.gemsEarned,
      ended_at: new Date().toISOString(),
    })
    .select('id')
    .single();
  if (sesErr) throw sesErr;

  if (input.attempts.length > 0) {
    const rows = input.attempts.map((a) => ({
      session_id: session.id,
      exercise_json: a.exercise as unknown as Json,
      given_answer: a.given as unknown as Json,
      is_correct: a.isCorrect,
      error_type: a.errorType,
      ms_taken: a.msTaken,
    }));
    const { error: attErr } = await supabase.from('attempt').insert(rows);
    if (attErr) throw attErr;
  }

  await updateStreakAndReward(input.childId, input.gemsTotal);

  if (blockId) {
    const accuracy =
      input.total > 0 ? Math.round((input.correctCount / input.total) * 100) : 0;
    await bumpBlockProgress(input.childId, blockId, accuracy);
  }
}
