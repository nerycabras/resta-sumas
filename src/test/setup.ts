// Setup de tests: localStorage en memoria para el entorno node, de modo que el
// middleware `persist` de Zustand funcione sin un DOM real.

class MemStorage implements Storage {
  private m = new Map<string, string>();
  get length() {
    return this.m.size;
  }
  clear() {
    this.m.clear();
  }
  getItem(key: string) {
    return this.m.has(key) ? this.m.get(key)! : null;
  }
  key(i: number) {
    return [...this.m.keys()][i] ?? null;
  }
  removeItem(key: string) {
    this.m.delete(key);
  }
  setItem(key: string, value: string) {
    this.m.set(key, String(value));
  }
}

// Node expone un `localStorage` nativo que lanza sin configurar, así que lo
// sustituimos siempre por el mock en memoria.
Object.defineProperty(globalThis, 'localStorage', {
  value: new MemStorage(),
  configurable: true,
  writable: true,
});
