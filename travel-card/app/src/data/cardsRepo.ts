import type { CardInput, CardProblem } from '../core/cardRules';
import { validateCard } from '../core/cardRules';
import type { CardItemData } from '../core/compose';
import type { Db } from './db';

export interface CardRecord {
  id: string;
  label: string;
  showLabel: boolean;
  categoryId: string;
  favourite: boolean;
  favouriteOrder: number | null;
  sortOrder: number;
  photoFile: string | null;
  thumbFile: string | null;
  exampleKey: string | null;
  createdAt: string;
  updatedAt: string;
  item: CardItemData | null;
}

export interface Deps {
  newId: () => string;
  now: () => string;
}

export class CardValidationError extends Error {
  problems: CardProblem[];
  constructor(problems: CardProblem[]) {
    super(`The card is not valid: ${problems.join(', ')}`);
    this.name = 'CardValidationError';
    this.problems = problems;
  }
}

/** Photo files a card no longer uses after a change; the caller deletes them once the change is saved. */
export interface FreedFiles {
  photoFile: string | null;
  thumbFile: string | null;
}

interface Row {
  id: string;
  label: string;
  show_label: number;
  category_id: string;
  favourite: number;
  favourite_order: number | null;
  sort_order: number;
  photo_file: string | null;
  thumb_file: string | null;
  example_key: string | null;
  created_at: string;
  updated_at: string;
  symbol_id: string | null;
  badge1: string | null;
  badge2: string | null;
}

const SELECT = `SELECT c.*, i.symbol_id, i.badge1, i.badge2
  FROM cards c LEFT JOIN card_items i ON i.card_id = c.id AND i.position = 0
  LEFT JOIN categories g ON g.id = c.category_id`;

function toRecord(r: Row): CardRecord {
  return {
    id: r.id,
    label: r.label,
    showLabel: r.show_label === 1,
    categoryId: r.category_id,
    favourite: r.favourite === 1,
    favouriteOrder: r.favourite_order,
    sortOrder: r.sort_order,
    photoFile: r.photo_file,
    thumbFile: r.thumb_file,
    exampleKey: r.example_key,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    item: r.symbol_id ? { symbolId: r.symbol_id, badges: [r.badge1, r.badge2].filter((b): b is string => !!b) } : null,
  };
}

async function writeItem(tx: Db, cardId: string, item: CardItemData | null): Promise<void> {
  await tx.run('DELETE FROM card_items WHERE card_id = ?', [cardId]);
  if (item) {
    await tx.run('INSERT INTO card_items (card_id, position, kind, symbol_id, badge1, badge2) VALUES (?, 0, ?, ?, ?, ?)', [
      cardId, 'symbol', item.symbolId, item.badges[0] ?? null, item.badges[1] ?? null,
    ]);
  }
}

async function nextSortOrder(tx: Db, categoryId: string): Promise<number> {
  const r = await tx.first<{ n: number }>('SELECT COALESCE(MAX(sort_order), 0) + 1 AS n FROM cards WHERE category_id = ?', [categoryId]);
  return r?.n ?? 1;
}

async function nextFavouriteOrder(tx: Db): Promise<number> {
  const r = await tx.first<{ n: number }>('SELECT COALESCE(MAX(favourite_order), 0) + 1 AS n FROM cards WHERE favourite = 1');
  return r?.n ?? 1;
}

export function createCardsRepo(db: Db, deps: Deps) {
  async function requireCategory(tx: Db, id: string): Promise<void> {
    const c = await tx.first<{ id: string }>('SELECT id FROM categories WHERE id = ?', [id]);
    if (!c) throw new Error(`Unknown category ${id}`);
  }

  return {
    async get(id: string): Promise<CardRecord | null> {
      const r = await db.first<Row>(`${SELECT} WHERE c.id = ?`, [id]);
      return r ? toRecord(r) : null;
    },

    /** All cards, in category order then card order (the real Home grouping arrives in milestone 3). */
    async list(): Promise<CardRecord[]> {
      const rows = await db.all<Row>(`${SELECT} ORDER BY g.sort_order, c.sort_order`);
      return rows.map(toRecord);
    },

    async count(): Promise<number> {
      const r = await db.first<{ n: number }>('SELECT COUNT(*) AS n FROM cards');
      return r?.n ?? 0;
    },

    /** Creates a card at the end of its category. Throws CardValidationError when it breaks a rule. */
    async create(input: CardInput, opts: { exampleKey?: string } = {}): Promise<string> {
      const problems = validateCard(input);
      if (problems.length) throw new CardValidationError(problems);
      const id = deps.newId();
      const now = deps.now();
      await db.transaction(async (tx) => {
        await requireCategory(tx, input.categoryId);
        const sort = await nextSortOrder(tx, input.categoryId);
        const favOrder = input.favourite ? await nextFavouriteOrder(tx) : null;
        await tx.run(
          `INSERT INTO cards (id, label, show_label, category_id, favourite, favourite_order, sort_order, photo_file, thumb_file, example_key, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, input.label.trim(), input.showLabel ? 1 : 0, input.categoryId, input.favourite ? 1 : 0, favOrder, sort,
            input.photoFile, input.thumbFile, opts.exampleKey ?? null, now, now],
        );
        await writeItem(tx, id, input.item);
      });
      return id;
    },

    /** Saves changes. Returns the photo files the card no longer uses, to delete after this call succeeded. */
    async update(id: string, input: CardInput): Promise<FreedFiles> {
      const problems = validateCard(input);
      if (problems.length) throw new CardValidationError(problems);
      return db.transaction(async (tx) => {
        const old = await tx.first<Row>(`${SELECT} WHERE c.id = ?`, [id]);
        if (!old) throw new Error(`Unknown card ${id}`);
        await requireCategory(tx, input.categoryId);
        const sort = old.category_id === input.categoryId ? old.sort_order : await nextSortOrder(tx, input.categoryId);
        let favOrder = old.favourite_order;
        if (input.favourite && old.favourite !== 1) favOrder = await nextFavouriteOrder(tx);
        if (!input.favourite) favOrder = null;
        await tx.run(
          `UPDATE cards SET label = ?, show_label = ?, category_id = ?, favourite = ?, favourite_order = ?, sort_order = ?,
             photo_file = ?, thumb_file = ?, updated_at = ? WHERE id = ?`,
          [input.label.trim(), input.showLabel ? 1 : 0, input.categoryId, input.favourite ? 1 : 0, favOrder, sort,
            input.photoFile, input.thumbFile, deps.now(), id],
        );
        await writeItem(tx, id, input.item);
        return {
          photoFile: old.photo_file && old.photo_file !== input.photoFile ? old.photo_file : null,
          thumbFile: old.thumb_file && old.thumb_file !== input.thumbFile ? old.thumb_file : null,
        };
      });
    },

    /** Deletes the card and returns its photo files for the caller to remove. */
    async delete(id: string): Promise<FreedFiles> {
      return db.transaction(async (tx) => {
        const old = await tx.first<Row>(`${SELECT} WHERE c.id = ?`, [id]);
        if (!old) return { photoFile: null, thumbFile: null };
        await tx.run('DELETE FROM cards WHERE id = ?', [id]); // the item row goes with it (cascade)
        return { photoFile: old.photo_file, thumbFile: old.thumb_file };
      });
    },

    /**
     * Copies a card: same item, a copy of the photo (made by copyPhoto, so deleting one never breaks the other),
     * label plus the suffix text, same category, not a favourite, no example key, placed right after the original.
     */
    async duplicate(
      id: string,
      opts: {
        labelFor: (label: string) => string;
        copyPhoto: (photoFile: string, thumbFile: string) => Promise<{ photoFile: string; thumbFile: string }>;
      },
    ): Promise<string> {
      const src = await this.get(id);
      if (!src) throw new Error(`Unknown card ${id}`);
      let photo = { photoFile: null as string | null, thumbFile: null as string | null };
      if (src.photoFile && src.thumbFile) photo = await opts.copyPhoto(src.photoFile, src.thumbFile);
      const newId = deps.newId();
      const now = deps.now();
      await db.transaction(async (tx) => {
        await tx.run('UPDATE cards SET sort_order = sort_order + 1 WHERE category_id = ? AND sort_order > ?', [src.categoryId, src.sortOrder]);
        await tx.run(
          `INSERT INTO cards (id, label, show_label, category_id, favourite, favourite_order, sort_order, photo_file, thumb_file, example_key, created_at, updated_at)
           VALUES (?, ?, ?, ?, 0, NULL, ?, ?, ?, NULL, ?, ?)`,
          [newId, src.label ? opts.labelFor(src.label) : '', src.showLabel ? 1 : 0, src.categoryId, src.sortOrder + 1,
            photo.photoFile, photo.thumbFile, now, now],
        );
        await writeItem(tx, newId, src.item);
      });
      return newId;
    },

    async setFavourite(id: string, favourite: boolean): Promise<void> {
      await db.transaction(async (tx) => {
        const old = await tx.first<Row>('SELECT * FROM cards WHERE id = ?', [id]);
        if (!old || (old.favourite === 1) === favourite) return;
        const order = favourite ? await nextFavouriteOrder(tx) : null;
        await tx.run('UPDATE cards SET favourite = ?, favourite_order = ?, updated_at = ? WHERE id = ?', [favourite ? 1 : 0, order, deps.now(), id]);
      });
    },


    /**
     * Reorder (Functional Analysis 8): moves a card one place up or down inside its own list. A favourite moves among the
     * favourites; any other card moves among the non-favourite cards of its category. Returns false at the end of the list.
     */
    async move(id: string, direction: 'up' | 'down'): Promise<boolean> {
      return db.transaction(async (tx) => {
        const me = await tx.first<Row>('SELECT * FROM cards WHERE id = ?', [id]);
        if (!me) return false;
        const fav = me.favourite === 1;
        const col = fav ? 'favourite_order' : 'sort_order';
        const mine = (fav ? me.favourite_order : me.sort_order) as number;
        const where = fav ? 'favourite = 1' : 'favourite = 0 AND category_id = ?';
        const params = fav ? [mine] : [me.category_id, mine];
        const other = await tx.first<Row>(
          `SELECT * FROM cards WHERE ${where} AND ${col} ${direction === 'up' ? '<' : '>'} ? ORDER BY ${col} ${direction === 'up' ? 'DESC' : 'ASC'} LIMIT 1`,
          params,
        );
        if (!other) return false;
        const theirs = (fav ? other.favourite_order : other.sort_order) as number;
        await tx.run(`UPDATE cards SET ${col} = ? WHERE id = ?`, [theirs, me.id]);
        await tx.run(`UPDATE cards SET ${col} = ? WHERE id = ?`, [mine, other.id]);
        return true;
      });
    },

    async hasExample(key: string): Promise<boolean> {
      const r = await db.first<{ n: number }>('SELECT COUNT(*) AS n FROM cards WHERE example_key = ?', [key]);
      return (r?.n ?? 0) > 0;
    },

    /** Every photo file name some card refers to (used to delete leftovers at start). */
    async referencedFiles(): Promise<Set<string>> {
      const rows = await db.all<{ photo_file: string | null; thumb_file: string | null }>(
        'SELECT photo_file, thumb_file FROM cards WHERE photo_file IS NOT NULL OR thumb_file IS NOT NULL',
      );
      const set = new Set<string>();
      for (const r of rows) {
        if (r.photo_file) set.add(r.photo_file);
        if (r.thumb_file) set.add(r.thumb_file);
      }
      return set;
    },
  };
}

export type CardsRepo = ReturnType<typeof createCardsRepo>;
