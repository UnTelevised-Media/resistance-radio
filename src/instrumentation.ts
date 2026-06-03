export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Node.js v22+ exposes localStorage as a global (Web Storage API).
    // Next.js/Turbopack passes --localstorage-file as part of its own IPC
    // protocol; on Node.js v25 that flag is interpreted as the Web Storage
    // persistence path. Without a valid path the native stub is broken and
    // localStorage.getItem is not a function, crashing SSR.
    // Provide a working in-memory shim whenever the native object is broken.
    const ls = (globalThis as Record<string, unknown>).localStorage as
      | { getItem?: unknown }
      | undefined;
    if (ls !== undefined && typeof ls.getItem !== 'function') {
      const store: Record<string, string> = {};
      Object.defineProperty(globalThis, 'localStorage', {
        value: {
          getItem: (key: string) => (key in store ? store[key] : null),
          setItem: (key: string, value: string) => {
            store[key] = String(value);
          },
          removeItem: (key: string) => {
            delete store[key];
          },
          clear: () => {
            Object.keys(store).forEach((k) => delete store[k]);
          },
          key: (index: number) => Object.keys(store)[index] ?? null,
          get length() {
            return Object.keys(store).length;
          },
        } satisfies Storage,
        writable: true,
        configurable: true,
      });
    }
  }
}
