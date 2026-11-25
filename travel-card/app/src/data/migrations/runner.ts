import { getUserVersion, type Db } from '../db';

export interface MigrationContext {
  now: () => string;
  newId: () => string;
}

/** Migration N brings the database from version N-1 to N. A shipped migration is never edited (Technical Analysis 7.3). */
export interface Migration {
  version: number;
  name: string;
  up(tx: Db, ctx: MigrationContext): Promise<void>;
}

export class DatabaseTooNewError extends Error {
  found: number;
  known: number;
  constructor(found: number, known: number) {
    super(`The database is version ${found} but this app only knows version ${known}.`);
    this.name = 'DatabaseTooNewError';
    this.found = found;
    this.known = known;
  }
}

export class MigrationError extends Error {
  step: number;
  constructor(step: number, cause: unknown) {
    super(`Database upgrade to version ${step} failed: ${cause instanceof Error ? cause.message : String(cause)}`);
    this.name = 'MigrationError';
    this.step = step;
  }
}

export interface MigrateHooks {
  /** Called once before the first missing step runs (the app copies the database file here). Failures here are not fatal. */
  beforeMigrate?(from: number, to: number): Promise<void>;
}

/**
 * Reads user_version and runs the missing steps in order, each in one transaction together with the version bump.
 * A failed step rolls back and throws; no data is deleted. A database newer than the app is refused, never guessed at.
 */
export async function migrate(
  db: Db,
  migrations: Migration[],
  ctx: MigrationContext,
  hooks: MigrateHooks = {},
): Promise<{ from: number; to: number }> {
  const sorted = [...migrations].sort((a, b) => a.version - b.version);
  sorted.forEach((m, i) => {
    if (m.version !== i + 1) throw new Error(`Migrations must be numbered 1, 2, 3 without gaps (found ${m.version} at place ${i + 1}).`);
  });
  const latest = sorted.length;
  const from = await getUserVersion(db);
  if (from > latest) throw new DatabaseTooNewError(from, latest);
  if (from === latest) return { from, to: from };
  if (from > 0 && hooks.beforeMigrate) {
    try {
      await hooks.beforeMigrate(from, latest);
    } catch {
      // A missing safety copy must not stop the upgrade; the transaction below is the real protection.
    }
  }
  for (const m of sorted) {
    if (m.version <= from) continue;
    try {
      await db.transaction(async (tx) => {
        await m.up(tx, ctx);
        await tx.exec(`PRAGMA user_version = ${m.version}`);
      });
    } catch (e) {
      throw new MigrationError(m.version, e);
    }
  }
  return { from, to: latest };
}
