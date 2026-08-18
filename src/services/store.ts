/**
 * Shared localStorage-backed store for prototype data.
 *
 * Services read from and write to this store so that refreshing the page
 * does not reset the demo. When a real backend is connected, replace the
 * bodies of each service with Axios calls — the store can be removed.
 */
const PREFIX = 'cybertrace_';

export const store = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      /* ignore quota errors in prototype */
    }
  },
  remove(key: string): void {
    localStorage.removeItem(PREFIX + key);
  },
  clearAll(): void {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  },
};
