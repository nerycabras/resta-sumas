// Niño seleccionado ("¿Quién juega hoy?"). Se persiste el id para recordar la
// selección entre recargas; los datos se recargan desde Supabase.
import { create } from 'zustand';
import { persist, type PersistStorage } from 'zustand/middleware';
import type { Child } from '../data/children.ts';

interface ChildState {
  child: Child | null;
  select: (child: Child) => void;
  clear: () => void;
}

type Persisted = Pick<ChildState, 'child'>;

const safeStorage: PersistStorage<Persisted> = {
  getItem: (name) => {
    try {
      const raw = globalThis.localStorage?.getItem(name);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      globalThis.localStorage?.setItem(name, JSON.stringify(value));
    } catch {
      /* sin persistencia */
    }
  },
  removeItem: (name) => {
    try {
      globalThis.localStorage?.removeItem(name);
    } catch {
      /* sin persistencia */
    }
  },
};

export const useChild = create<ChildState>()(
  persist(
    (set) => ({
      child: null,
      select: (child) => set({ child }),
      clear: () => set({ child: null }),
    }),
    {
      name: 'zorro-nino',
      storage: safeStorage,
      partialize: (s): Persisted => ({ child: s.child }),
    },
  ),
);
