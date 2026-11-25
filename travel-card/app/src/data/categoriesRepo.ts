import type { Db } from './db';

export interface CategoryRecord {
  id: string;
  kind: 'default' | 'custom';
  /** Only custom categories have a stored name; default names come from the text file (category.<id>). */
  name: string | null;
  hidden: boolean;
  sortOrder: number;
}

interface Row {
  id: string;
  kind: 'default' | 'custom';
  name: string | null;
  hidden: number;
  sort_order: number;
}

export type DeleteCategoryResult = { ok: true } | { ok: false; reason: 'not-custom' | 'not-empty' | 'unknown'; cardCount?: number };

export interface CategoryDeps {
  newId: () => string;
}

/** Categories screen rules (Functional Analysis v0.6 5.4): hide default ones; create, rename, delete-when-empty custom ones. */
export function createCategoriesRepo(db: Db, deps: CategoryDeps = { newId: () => `c_${Date.now()}` }) {
  const map = (r: Row): CategoryRecord => ({ id: r.id, kind: r.kind, name: r.name, hidden: r.hidden === 1, sortOrder: r.sort_order });
  return {
    async list(): Promise<CategoryRecord[]> {
      return (await db.all<Row>('SELECT * FROM categories ORDER BY sort_order')).map(map);
    },

    async get(id: string): Promise<CategoryRecord | null> {
      const r = await db.first<Row>('SELECT * FROM categories WHERE id = ?', [id]);
      return r ? map(r) : null;
    },

    async countCards(id: string): Promise<number> {
      const r = await db.first<{ n: number }>('SELECT COUNT(*) AS n FROM cards WHERE category_id = ?', [id]);
      return r?.n ?? 0;
    },

    /** New custom category at the end. A name cannot be empty. Returns the new id, or null when the name is empty. */
    async create(name: string): Promise<string | null> {
      const clean = name.trim();
      if (!clean) return null;
      const id = deps.newId();
      await db.transaction(async (tx) => {
        const r = await tx.first<{ n: number }>('SELECT COALESCE(MAX(sort_order), 0) + 1 AS n FROM categories');
        await tx.run('INSERT INTO categories (id, kind, name, hidden, sort_order) VALUES (?, ?, ?, 0, ?)', [id, 'custom', clean, r?.n ?? 1]);
      });
      return id;
    },

    /** Renames a custom category. Default categories keep their names. */
    async rename(id: string, name: string): Promise<boolean> {
      const clean = name.trim();
      if (!clean) return false;
      const r = await db.run("UPDATE categories SET name = ? WHERE id = ? AND kind = 'custom'", [clean, id]);
      return r.changes === 1;
    },

    /** Show or hide a default category. A hidden one is not offered in the editor; its cards stay on Home. */
    async setHidden(id: string, hidden: boolean): Promise<boolean> {
      const r = await db.run("UPDATE categories SET hidden = ? WHERE id = ? AND kind = 'default'", [hidden ? 1 : 0, id]);
      return r.changes === 1;
    },

    /** Deletes a custom category, only when it holds no card (favourites counted). */
    async delete(id: string): Promise<DeleteCategoryResult> {
      return db.transaction(async (tx) => {
        const c = await tx.first<Row>('SELECT * FROM categories WHERE id = ?', [id]);
        if (!c) return { ok: false, reason: 'unknown' } as const;
        if (c.kind !== 'custom') return { ok: false, reason: 'not-custom' } as const;
        const n = (await tx.first<{ n: number }>('SELECT COUNT(*) AS n FROM cards WHERE category_id = ?', [id]))?.n ?? 0;
        if (n > 0) return { ok: false, reason: 'not-empty', cardCount: n } as const;
        await tx.run('DELETE FROM categories WHERE id = ?', [id]);
        return { ok: true } as const;
      });
    },
  };
}

export type CategoriesRepo = ReturnType<typeof createCategoriesRepo>;
