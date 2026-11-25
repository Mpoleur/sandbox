import fs from 'fs';
import path from 'path';
import { CARD_CATEGORY_KEYS } from '../src/core/catalog';
import { getUserVersion } from '../src/data/db';
import { CardValidationError, createCardsRepo } from '../src/data/cardsRepo';
import { createCategoriesRepo } from '../src/data/categoriesRepo';
import { createSettingsRepo } from '../src/data/settingsRepo';
import { MIGRATIONS, m001 } from '../src/data/migrations';
import { DatabaseTooNewError, MigrationError, migrate, type Migration } from '../src/data/migrations/runner';
import { SqlJsDb, testDeps } from './helpers/sqljsDb';

const FIXTURE = path.join(__dirname, 'fixtures', 'v1.db');

async function freshDb() {
  const db = await SqlJsDb.create();
  await migrate(db, [m001], testDeps); // version 1, as on a phone that has not upgraded yet
  return db;
}

const peanut = { label: 'No peanuts', showLabel: false, categoryId: 'diet-allergies', favourite: false, photoFile: null, thumbFile: null, item: { symbolId: 'DIE-01', badges: ['MOD-01'] } };
const photoOnly = { label: 'Hotel', showLabel: true, categoryId: 'accommodation', favourite: false, photoFile: 'a-photo.jpg', thumbFile: 'a-thumb.jpg', item: null };

describe('migration 1 (first schema, categories, examples)', () => {
  test('a new database becomes version 1 with 13 default categories and 3 example cards', async () => {
    const db = await freshDb();
    expect(await getUserVersion(db)).toBe(1);
    const cats = await createCategoriesRepo(db).list();
    expect(cats.map((c) => c.id)).toEqual([...CARD_CATEGORY_KEYS]);
    expect(cats).toHaveLength(13);
    expect(cats.every((c) => c.kind === 'default' && !c.hidden)).toBe(true);
    const cards = await createCardsRepo(db, testDeps).list();
    expect(cards).toHaveLength(3);
    const byKey = Object.fromEntries(cards.map((c) => [c.exampleKey, c]));
    expect(byKey.peanut).toMatchObject({ label: "No peanuts, I'm allergic", categoryId: 'diet-allergies', favourite: true, item: { symbolId: 'DIE-01', badges: ['MOD-01', 'MOD-03'] } });
    expect(byKey.toilet).toMatchObject({ label: 'Where is the toilet?', categoryId: 'places-directions', favourite: false, item: { symbolId: 'BAS-01', badges: ['MOD-04'] } });
    expect(byKey.dog).toMatchObject({ label: 'Can my dog come in?', categoryId: 'pets', favourite: false, item: { symbolId: 'PET-03', badges: [] } });
    expect(await createSettingsRepo(db).get('examplesSeeded')).toBe('1');
  });

  test('running it again does nothing (no duplicate examples)', async () => {
    const db = await freshDb();
    const r = await migrate(db, [m001], testDeps);
    expect(r).toEqual({ from: 1, to: 1 });
    expect(await createCardsRepo(db, testDeps).count()).toBe(3);
  });
});

describe('upgrade runner', () => {
  test('a database newer than the app is refused, not guessed at', async () => {
    const db = await freshDb();
    await db.exec('PRAGMA user_version = 9');
    await expect(migrate(db, [m001], testDeps)).rejects.toBeInstanceOf(DatabaseTooNewError);
    expect(await createCardsRepo(db, testDeps).count()).toBe(3);
  });

  test('a failing step rolls back completely and keeps every card', async () => {
    const db = await freshDb();
    const bad: Migration = {
      version: 2,
      name: 'broken',
      async up(tx) {
        await tx.exec('ALTER TABLE cards ADD COLUMN half_done TEXT');
        await tx.run("DELETE FROM cards WHERE example_key = 'dog'");
        throw new Error('boom');
      },
    };
    await expect(migrate(db, [...[m001], bad], testDeps)).rejects.toBeInstanceOf(MigrationError);
    expect(await getUserVersion(db)).toBe(1);
    expect(await createCardsRepo(db, testDeps).count()).toBe(3);
    const cols = await db.all<{ name: string }>('PRAGMA table_info(cards)');
    expect(cols.some((c) => c.name === 'half_done')).toBe(false);
  });

  test('the safety-copy hook runs once before the first missing step, only when a database already exists', async () => {
    const calls: number[][] = [];
    const db = await SqlJsDb.create();
    await migrate(db, [m001], testDeps, { beforeMigrate: async (f, t) => { calls.push([f, t]); } });
    expect(calls).toEqual([]); // brand new: nothing to copy
    await migrate(db, MIGRATIONS, testDeps, { beforeMigrate: async (f, t) => { calls.push([f, t]); } });
    expect(calls).toEqual([[1, 2]]);
  });

  test('a failing safety copy does not stop the upgrade', async () => {
    const db = await freshDb();
    const r = await migrate(db, MIGRATIONS, testDeps, { beforeMigrate: async () => { throw new Error('disk'); } });
    expect(r).toEqual({ from: 1, to: 2 });
  });

  test('numbering must be 1, 2, 3 without gaps', async () => {
    const db = await SqlJsDb.create();
    const m = [m001][0];
    await expect(migrate(db, [{ ...m, version: 2 }], testDeps)).rejects.toThrow(/without gaps/);
  });
});

describe('sample database of version 1 (fixture) survives the update-test upgrade', () => {
  test('a committed v1 database opens, upgrades to 2 and keeps every card, photo name and favourite', async () => {
    if (!fs.existsSync(FIXTURE)) {
      // The fixture is made once by the code of migration 1 plus two cards, then committed (Technical Analysis 7.3).
      fs.mkdirSync(path.dirname(FIXTURE), { recursive: true });
      const db = await freshDb();
      const repo = createCardsRepo(db, testDeps);
      await repo.create({ ...peanut, favourite: true });
      await repo.create(photoOnly);
      fs.writeFileSync(FIXTURE, db.export());
    }
    const db = await SqlJsDb.create(fs.readFileSync(FIXTURE));
    expect(await getUserVersion(db)).toBe(1);
    const before = await createCardsRepo(db, testDeps).list();
    expect(before).toHaveLength(5);
    await migrate(db, MIGRATIONS, testDeps);
    expect(await getUserVersion(db)).toBe(2);
    const after = await createCardsRepo(db, testDeps).list();
    expect(after).toEqual(before);
    expect(after.find((c) => c.photoFile === 'a-photo.jpg')?.item).toBeNull();
    expect(await createSettingsRepo(db).get('updateTestMigrated')).toBe('1');
  });
});

describe('card service', () => {
  test('create puts the card last in its category, with its item and badges', async () => {
    const db = await freshDb();
    const repo = createCardsRepo(db, testDeps);
    const id1 = await repo.create(peanut);
    const id2 = await repo.create({ ...peanut, label: 'second', item: { symbolId: 'DIE-02', badges: ['MOD-03', 'MOD-04'] } });
    const a = await repo.get(id1);
    const b = await repo.get(id2);
    expect(b!.sortOrder).toBe(a!.sortOrder + 1);
    expect(b!.item).toEqual({ symbolId: 'DIE-02', badges: ['MOD-03', 'MOD-04'] });
    expect(a!.label).toBe('No peanuts');
  });

  test('a card needs a symbol or a photo; photo cards need both files', async () => {
    const db = await freshDb();
    const repo = createCardsRepo(db, testDeps);
    await expect(repo.create({ ...peanut, item: null })).rejects.toBeInstanceOf(CardValidationError);
    await expect(repo.create({ ...photoOnly, thumbFile: null })).rejects.toBeInstanceOf(CardValidationError);
    const id = await repo.create(photoOnly);
    expect((await repo.get(id))!.item).toBeNull();
    const both = await repo.create({ ...peanut, photoFile: 'p.jpg', thumbFile: 't.jpg' });
    expect((await repo.get(both))!.photoFile).toBe('p.jpg');
  });

  test('badge rules are enforced by the service too', async () => {
    const db = await freshDb();
    const repo = createCardsRepo(db, testDeps);
    await expect(repo.create({ ...peanut, item: { symbolId: 'DIE-01', badges: ['MOD-01', 'MOD-03', 'MOD-04'] } })).rejects.toBeInstanceOf(CardValidationError);
    await expect(repo.create({ ...peanut, item: { symbolId: 'DIE-13', badges: ['MOD-01'] } })).rejects.toBeInstanceOf(CardValidationError);
    await expect(repo.create({ ...peanut, item: { symbolId: 'MOD-03', badges: [] } })).rejects.toBeInstanceOf(CardValidationError);
    await expect(repo.create({ ...peanut, categoryId: 'no-such-category' })).rejects.toThrow(/Unknown category/);
  });

  test('update changes fields, moves categories to the end, and reports the photo files it freed', async () => {
    const db = await freshDb();
    const repo = createCardsRepo(db, testDeps);
    const id = await repo.create(photoOnly);
    const other = await repo.create({ ...photoOnly, photoFile: 'x.jpg', thumbFile: 'y.jpg' });
    const freed = await repo.update(id, { ...photoOnly, label: 'Hotel 2', photoFile: 'new-photo.jpg', thumbFile: 'new-thumb.jpg', categoryId: 'transport', item: { symbolId: 'TRA-03', badges: [] } });
    expect(freed).toEqual({ photoFile: 'a-photo.jpg', thumbFile: 'a-thumb.jpg' });
    const c = await repo.get(id);
    expect(c).toMatchObject({ label: 'Hotel 2', categoryId: 'transport', photoFile: 'new-photo.jpg', item: { symbolId: 'TRA-03', badges: [] } });
    expect((await repo.get(other))!.categoryId).toBe('accommodation');
    const keep = await repo.update(id, { ...photoOnly, categoryId: 'transport', photoFile: 'new-photo.jpg', thumbFile: 'new-thumb.jpg', item: null });
    expect(keep).toEqual({ photoFile: null, thumbFile: null });
    const removedPhoto = await repo.update(id, { ...peanut, categoryId: 'transport' });
    expect(removedPhoto).toEqual({ photoFile: 'new-photo.jpg', thumbFile: 'new-thumb.jpg' });
  });

  test('delete removes the card and its item, and returns the photo files', async () => {
    const db = await freshDb();
    const repo = createCardsRepo(db, testDeps);
    const id = await repo.create({ ...peanut, photoFile: 'p.jpg', thumbFile: 't.jpg' });
    expect(await repo.delete(id)).toEqual({ photoFile: 'p.jpg', thumbFile: 't.jpg' });
    expect(await repo.get(id)).toBeNull();
    const items = await db.all('SELECT * FROM card_items WHERE card_id = ?', [id]);
    expect(items).toHaveLength(0);
    expect(await repo.delete(id)).toEqual({ photoFile: null, thumbFile: null });
  });

  test('duplicate copies the card and its photo, adds the suffix, is not a favourite, sits right after the original', async () => {
    const db = await freshDb();
    const repo = createCardsRepo(db, testDeps);
    const a = await repo.create({ ...peanut, favourite: true, photoFile: 'p.jpg', thumbFile: 't.jpg' });
    const b = await repo.create({ ...peanut, label: 'later' });
    const copy = await repo.duplicate(a, {
      labelFor: (l) => `${l} (copy)`,
      copyPhoto: async () => ({ photoFile: 'p2.jpg', thumbFile: 't2.jpg' }),
    });
    const orig = (await repo.get(a))!;
    const c = (await repo.get(copy))!;
    expect(c.label).toBe('No peanuts (copy)');
    expect(c.photoFile).toBe('p2.jpg');
    expect(c.favourite).toBe(false);
    expect(c.exampleKey).toBeNull();
    expect(c.item).toEqual(orig.item);
    expect(c.sortOrder).toBe(orig.sortOrder + 1);
    expect((await repo.get(b))!.sortOrder).toBe(orig.sortOrder + 2);
  });

  test('duplicating an example card does not copy its example key (Restore examples will still see it as one card)', async () => {
    const db = await freshDb();
    const repo = createCardsRepo(db, testDeps);
    const dog = (await repo.list()).find((c) => c.exampleKey === 'dog')!;
    const copy = await repo.duplicate(dog.id, { labelFor: (l) => `${l} (copy)`, copyPhoto: async () => { throw new Error('no photo'); } });
    expect((await repo.get(copy))!.exampleKey).toBeNull();
    expect((await repo.list()).filter((c) => c.exampleKey === 'dog')).toHaveLength(1);
  });

  test('favourites get their own order; un-starring clears it and keeps the place in the category', async () => {
    const db = await freshDb();
    const repo = createCardsRepo(db, testDeps);
    const a = await repo.create(peanut);
    const b = await repo.create({ ...peanut, label: 'b' });
    await repo.setFavourite(b, true);
    await repo.setFavourite(a, true);
    const fa = (await repo.get(a))!;
    const fb = (await repo.get(b))!;
    expect(fb.favouriteOrder).toBeLessThan(fa.favouriteOrder!);
    await repo.setFavourite(a, false);
    const na = (await repo.get(a))!;
    expect(na.favouriteOrder).toBeNull();
    expect(na.sortOrder).toBe(fa.sortOrder);
  });

  test('referencedFiles lists every photo and thumbnail name in use', async () => {
    const db = await freshDb();
    const repo = createCardsRepo(db, testDeps);
    await repo.create(photoOnly);
    expect([...(await repo.referencedFiles())].sort()).toEqual(['a-photo.jpg', 'a-thumb.jpg']);
  });
});

describe('settings', () => {
  test('get, set, replace and remove', async () => {
    const db = await freshDb();
    const s = createSettingsRepo(db);
    expect(await s.get('editorDraft')).toBeNull();
    await s.set('editorDraft', 'x');
    await s.set('editorDraft', 'y');
    expect(await s.get('editorDraft')).toBe('y');
    await s.remove('editorDraft');
    expect(await s.get('editorDraft')).toBeNull();
  });
});
