import { CARD_CATEGORY_KEYS } from '../../core/catalog';
import { t } from '../../core/i18n';
import { EXAMPLES } from '../examples';
import type { Migration } from './runner';

/** Version 1: the first schema (Technical Analysis 7.1), the 13 default categories and the three example cards. */
export const m001: Migration = {
  version: 1,
  name: 'initial schema, default categories, example cards',
  async up(tx, ctx) {
    await tx.exec(`
      CREATE TABLE categories (
        id TEXT PRIMARY KEY NOT NULL,
        kind TEXT NOT NULL CHECK (kind IN ('default', 'custom')),
        name TEXT,
        hidden INTEGER NOT NULL DEFAULT 0,
        sort_order INTEGER NOT NULL
      );
      CREATE TABLE cards (
        id TEXT PRIMARY KEY NOT NULL,
        label TEXT NOT NULL DEFAULT '',
        show_label INTEGER NOT NULL DEFAULT 0,
        category_id TEXT NOT NULL REFERENCES categories(id),
        favourite INTEGER NOT NULL DEFAULT 0,
        favourite_order INTEGER,
        sort_order INTEGER NOT NULL,
        photo_file TEXT,
        thumb_file TEXT,
        example_key TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE card_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
        position INTEGER NOT NULL,
        kind TEXT NOT NULL DEFAULT 'symbol',
        symbol_id TEXT NOT NULL,
        badge1 TEXT,
        badge2 TEXT,
        UNIQUE (card_id, position)
      );
      CREATE TABLE settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
      CREATE INDEX cards_category_order ON cards (category_id, sort_order);
      CREATE INDEX cards_favourite_order ON cards (favourite, favourite_order);
    `);
    for (let i = 0; i < CARD_CATEGORY_KEYS.length; i++) {
      await tx.run('INSERT INTO categories (id, kind, name, hidden, sort_order) VALUES (?, ?, NULL, 0, ?)', [CARD_CATEGORY_KEYS[i], 'default', i + 1]);
    }
    let favouriteOrder = 0;
    for (const ex of EXAMPLES) {
      const id = ctx.newId();
      const now = ctx.now();
      await tx.run(
        `INSERT INTO cards (id, label, show_label, category_id, favourite, favourite_order, sort_order, photo_file, thumb_file, example_key, created_at, updated_at)
         VALUES (?, ?, 0, ?, ?, ?, 1, NULL, NULL, ?, ?, ?)`,
        [id, t(ex.labelKey), ex.categoryId, ex.favourite ? 1 : 0, ex.favourite ? ++favouriteOrder : null, ex.key, now, now],
      );
      await tx.run('INSERT INTO card_items (card_id, position, kind, symbol_id, badge1, badge2) VALUES (?, 0, ?, ?, ?, ?)', [
        id, 'symbol', ex.item.symbolId, ex.item.badges[0] ?? null, ex.item.badges[1] ?? null,
      ]);
    }
    await tx.run("INSERT INTO settings (key, value) VALUES ('examplesSeeded', '1')");
  },
};
