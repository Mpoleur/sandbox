import * as SQLite from 'expo-sqlite';
import type { Db, RunResult, SqlValue } from '../data/db';

export const DB_NAME = 'travelcard.db';

/** The Db interface on top of expo-sqlite. Transactions are queued so two of them never overlap. */
class ExpoDb implements Db {
  private tail: Promise<unknown> = Promise.resolve();

  constructor(private raw: SQLite.SQLiteDatabase) {}

  async exec(sql: string): Promise<void> {
    await this.raw.execAsync(sql);
  }

  async run(sql: string, params: SqlValue[] = []): Promise<RunResult> {
    const r = await this.raw.runAsync(sql, params);
    return { changes: r.changes, lastInsertRowId: r.lastInsertRowId };
  }

  async all<T>(sql: string, params: SqlValue[] = []): Promise<T[]> {
    return this.raw.getAllAsync<T>(sql, params);
  }

  async first<T>(sql: string, params: SqlValue[] = []): Promise<T | null> {
    return this.raw.getFirstAsync<T>(sql, params);
  }

  transaction<T>(fn: (tx: Db) => Promise<T>): Promise<T> {
    const job = async (): Promise<T> => {
      let result!: T;
      await this.raw.withTransactionAsync(async () => {
        result = await fn(this);
      });
      return result;
    };
    const next = this.tail.then(job, job);
    this.tail = next.catch(() => undefined);
    return next;
  }
}

export interface OpenedDb {
  db: Db;
  /** Where the database file is (printed in the milestone 2 checks, check C6). */
  directory: string;
  fileName: string;
}

export async function openExpoDb(): Promise<OpenedDb> {
  const raw = await SQLite.openDatabaseAsync(DB_NAME);
  await raw.execAsync('PRAGMA foreign_keys = ON');
  return { db: new ExpoDb(raw), directory: String(SQLite.defaultDatabaseDirectory ?? ''), fileName: DB_NAME };
}
