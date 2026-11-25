/** The small database interface the app uses. One adapter wraps expo-sqlite (device), another wraps sql.js (tests). */
export type SqlValue = string | number | null;

export interface RunResult {
  changes: number;
  lastInsertRowId: number;
}

export interface Db {
  exec(sql: string): Promise<void>;
  run(sql: string, params?: SqlValue[]): Promise<RunResult>;
  all<T>(sql: string, params?: SqlValue[]): Promise<T[]>;
  first<T>(sql: string, params?: SqlValue[]): Promise<T | null>;
  /** Everything inside fn is one transaction: it all happens, or none of it does. */
  transaction<T>(fn: (tx: Db) => Promise<T>): Promise<T>;
}

export async function getUserVersion(db: Db): Promise<number> {
  const row = await db.first<{ user_version: number }>('PRAGMA user_version');
  return row?.user_version ?? 0;
}
