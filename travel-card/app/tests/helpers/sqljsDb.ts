import fs from 'fs';
import path from 'path';
import initSqlJs, { type Database } from 'sql.js';
import type { Db, RunResult, SqlValue } from '../../src/data/db';

let SQL: Awaited<ReturnType<typeof initSqlJs>> | null = null;

async function engine() {
  if (!SQL) {
    const wasm = path.join(__dirname, '..', '..', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
    SQL = await initSqlJs({ wasmBinary: fs.readFileSync(wasm) as unknown as ArrayBuffer });
  }
  return SQL;
}

/** The same Db interface as the app uses on the phone, on top of sql.js (SQLite compiled for Node). */
export class SqlJsDb implements Db {
  constructor(public raw: Database) {}

  static async create(bytes?: Uint8Array): Promise<SqlJsDb> {
    const s = await engine();
    const raw = bytes ? new s.Database(bytes) : new s.Database();
    raw.run('PRAGMA foreign_keys = ON');
    return new SqlJsDb(raw);
  }

  export(): Uint8Array {
    return this.raw.export();
  }

  async exec(sql: string): Promise<void> {
    this.raw.exec(sql);
  }

  async run(sql: string, params: SqlValue[] = []): Promise<RunResult> {
    this.raw.run(sql, params);
    const changes = this.raw.getRowsModified();
    const id = this.raw.exec('SELECT last_insert_rowid()')[0]?.values[0][0] as number;
    return { changes, lastInsertRowId: id };
  }

  async all<T>(sql: string, params: SqlValue[] = []): Promise<T[]> {
    const stmt = this.raw.prepare(sql);
    try {
      stmt.bind(params);
      const out: T[] = [];
      while (stmt.step()) out.push(stmt.getAsObject() as T);
      return out;
    } finally {
      stmt.free();
    }
  }

  async first<T>(sql: string, params: SqlValue[] = []): Promise<T | null> {
    const rows = await this.all<T>(sql, params);
    return rows.length ? rows[0] : null;
  }

  async transaction<T>(fn: (tx: Db) => Promise<T>): Promise<T> {
    this.raw.run('BEGIN');
    try {
      const r = await fn(this);
      this.raw.run('COMMIT');
      return r;
    } catch (e) {
      this.raw.run('ROLLBACK');
      throw e;
    }
  }
}

let counter = 0;
export const testDeps = {
  newId: () => {
    counter += 1;
    return `00000000-0000-4000-8000-${String(counter).padStart(12, '0')}`;
  },
  now: () => '2026-11-25T10:00:00.000Z',
};
