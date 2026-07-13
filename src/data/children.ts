// Acceso a datos de perfiles de niño (Supabase). RLS garantiza que el adulto
// solo ve/gestiona los suyos.
import { supabase } from '../lib/supabase.ts';
import type { Database } from '../lib/database.types.ts';

export type Child = Database['public']['Tables']['child']['Row'];

export async function listChildren(): Promise<Child[]> {
  const { data, error } = await supabase
    .from('child')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createChild(input: {
  name: string;
  avatar?: string;
  birth_year?: number | null;
}): Promise<Child> {
  // adult_id se rellena por defecto con auth.uid() en la BD.
  const { data, error } = await supabase
    .from('child')
    .insert({
      name: input.name,
      avatar: input.avatar ?? 'fox',
      birth_year: input.birth_year ?? null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateChild(
  id: string,
  patch: { name?: string; avatar?: string; birth_year?: number | null },
): Promise<Child> {
  const { data, error } = await supabase
    .from('child')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteChild(id: string): Promise<void> {
  const { error } = await supabase.from('child').delete().eq('id', id);
  if (error) throw error;
}
