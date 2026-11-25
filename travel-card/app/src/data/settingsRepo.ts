import type { Db } from './db';

export function createSettingsRepo(db: Db) {
  return {
    async get(key: string): Promise<string | null> {
      const r = await db.first<{ value: string }>('SELECT value FROM settings WHERE key = ?', [key]);
      return r ? r.value : null;
    },
    async set(key: string, value: string): Promise<void> {
      await db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
    },
    async remove(key: string): Promise<void> {
      await db.run('DELETE FROM settings WHERE key = ?', [key]);
    },
  };
}

export type SettingsRepo = ReturnType<typeof createSettingsRepo>;
