import { createCardsRepo } from '../src/data/cardsRepo';
import { createCategoriesRepo } from '../src/data/categoriesRepo';
import { restoreExamples } from '../src/data/examplesService';
import { MIGRATIONS } from '../src/data/migrations';
import { migrate } from '../src/data/migrations/runner';
import { buildHome, editorCategories, needsSafetyReminder } from '../src/core/homeModel';
import { getUserVersion } from '../src/data/db';
import { SqlJsDb, testDeps } from './helpers/sqljsDb';

async function setup() {
  const db = await SqlJsDb.create();
  await migrate(db, MIGRATIONS, testDeps);
  let n = 0;
  return { db, cards: createCardsRepo(db, testDeps), cats: createCategoriesRepo(db, { newId: () => `c_${++n}` }) };
}

const names = { card: (c: { label: string }) => c.label, symbol: (id: string) => id, category: (c: { id: string; name: string | null }) => c.name ?? c.id };
const base = { label: '', showLabel: false, favourite: false, photoFile: null, thumbFile: null };
const item = (id: string) => ({ symbolId: id, badges: [] as string[] });

describe('database stays at version 2 (the S22 already has it)', () => {
  test('a fresh database ends at version 2 and a version 1 database upgrades to 2', async () => {
    const { db } = await setup();
    expect(await getUserVersion(db)).toBe(2);
    expect(MIGRATIONS.map((m) => m.version)).toEqual([1, 2]);
    const old = await SqlJsDb.create();
    await migrate(old, [MIGRATIONS[0]], testDeps);
    await migrate(old, MIGRATIONS, testDeps);
    expect(await getUserVersion(old)).toBe(2);
  });
});

describe('categories (Functional Analysis v0.6 5.4)', () => {
  test('create, rename, hide: defaults can be hidden but not renamed or deleted; custom ones can be renamed', async () => {
    const { cats } = await setup();
    expect(await cats.create('   ')).toBeNull();
    const id = (await cats.create('  Trip to Japan ')) as string;
    expect((await cats.get(id))).toMatchObject({ kind: 'custom', name: 'Trip to Japan', hidden: false });
    expect(await cats.rename(id, 'Japan')).toBe(true);
    expect(await cats.rename(id, '  ')).toBe(false);
    expect(await cats.rename('pets', 'Dogs')).toBe(false);
    expect(await cats.setHidden('pets', true)).toBe(true);
    expect((await cats.get('pets'))!.hidden).toBe(true);
    expect(await cats.setHidden(id, true)).toBe(false);
    expect(await cats.delete('pets')).toEqual({ ok: false, reason: 'not-custom' });
    expect(await cats.delete('nope')).toEqual({ ok: false, reason: 'unknown' });
  });
  test('a custom category is deleted only when empty (favourites counted), otherwise it says how many cards', async () => {
    const { cats, cards } = await setup();
    const id = (await cats.create('Work')) as string;
    const card = await cards.create({ ...base, categoryId: id, favourite: true, item: item('BAS-01') });
    expect(await cats.delete(id)).toEqual({ ok: false, reason: 'not-empty', cardCount: 1 });
    await cards.delete(card);
    expect(await cats.delete(id)).toEqual({ ok: true });
    expect(await cats.get(id)).toBeNull();
  });
  test('the editor offers shown categories plus the card own category even when hidden', async () => {
    const { cats } = await setup();
    await cats.setHidden('pets', true);
    const all = await cats.list();
    expect(editorCategories(all, null).map((c) => c.id)).not.toContain('pets');
    expect(editorCategories(all, 'pets').map((c) => c.id)).toContain('pets');
    expect(editorCategories(all, null)).toHaveLength(12);
  });
});

describe('Home grouping and search', () => {
  test('a favourite appears only in Favourites; a category with no non-favourite card is not shown (default state)', async () => {
    const { cards, cats } = await setup();
    const m = buildHome(await cards.list(), await cats.list(), '', names);
    expect(m.favourites.map((c) => c.exampleKey)).toEqual(['peanut']);
    expect(m.sections.map((s) => s.category.id)).toEqual(['places-directions', 'pets']); // Diet & allergies hidden: its only card is a favourite
    expect(m.sections.flatMap((s) => s.cards).some((c) => c.favourite)).toBe(false);
  });
  test('a hidden default category that still holds cards stays on Home', async () => {
    const { cards, cats } = await setup();
    await cats.setHidden('pets', true);
    const m = buildHome(await cards.list(), await cats.list(), '', names);
    expect(m.sections.map((s) => s.category.id)).toContain('pets');
  });
  test('search covers card label, symbol name and category name, ignoring case and accents', async () => {
    const { cards, cats } = await setup();
    const c = await cats.create('Café trips');
    await cards.create({ ...base, label: 'Quick bite', categoryId: c as string, item: item('FOO-02') });
    const run = (q: string) => buildHome(cards_list, cat_list, q, { ...names, symbol: (id) => (id === 'FOO-02' ? 'Bill' : id) });
    const cards_list = await cards.list();
    const cat_list = await cats.list();
    expect(run('QUICK').sections.flatMap((s) => s.cards).map((x) => x.label)).toEqual(['Quick bite']);
    expect(run('bill').sections.flatMap((s) => s.cards)).toHaveLength(1);
    expect(run('cafe').sections.flatMap((s) => s.cards)).toHaveLength(1);
    expect(run('zzz').sections).toHaveLength(0);
    expect(run('zzz').favourites).toHaveLength(0);
    expect(run('Where is the toilet').sections.flatMap((s) => s.cards)).toHaveLength(1);
  });
  test('safety reminder: Allergy badge, or Health & emergency', () => {
    expect(needsSafetyReminder(['MOD-03'], 'basics')).toBe(true);
    expect(needsSafetyReminder([], 'health-emergency')).toBe(true);
    expect(needsSafetyReminder(['MOD-04'], 'basics')).toBe(false);
  });
});

describe('reorder (up and down inside the own list)', () => {
  test('non-favourites move inside their category; favourites move among favourites; ends refuse', async () => {
    const { cards } = await setup();
    const a = await cards.create({ ...base, label: 'a', categoryId: 'basics', item: item('BAS-01') });
    const b = await cards.create({ ...base, label: 'b', categoryId: 'basics', item: item('BAS-02') });
    const c = await cards.create({ ...base, label: 'c', categoryId: 'basics', item: item('BAS-03') });
    const order = async () => (await cards.list()).filter((x) => x.categoryId === 'basics').map((x) => x.label);
    expect(await order()).toEqual(['a', 'b', 'c']);
    expect(await cards.move(c, 'up')).toBe(true);
    expect(await order()).toEqual(['a', 'c', 'b']);
    expect(await cards.move(a, 'up')).toBe(false);
    expect(await cards.move(b, 'down')).toBe(false);
    expect(await cards.move(a, 'down')).toBe(true);
    expect(await order()).toEqual(['c', 'a', 'b']);
    // favourites are ordered on their own and do not disturb the category order
    await cards.setFavourite(a, true);
    await cards.setFavourite(b, true);
    const favs = async () => (await cards.list()).filter((x) => x.favourite).map((x) => x.label ?? '');
    expect((await favs()).filter((l) => ['a', 'b'].includes(l))).toEqual(['a', 'b']);
    expect(await cards.move(b, 'up')).toBe(true);
    const fl = (await cards.list()).filter((x) => x.favourite).sort((p, q) => p.favouriteOrder! - q.favouriteOrder!).map((x) => x.label);
    expect(fl.indexOf('b')).toBeLessThan(fl.indexOf('a'));
    expect((await cards.list()).filter((x) => x.categoryId === 'basics' && !x.favourite).map((x) => x.label)).toEqual(['c']);
  });
});

describe('restore example cards', () => {
  test('adds back only the missing examples, once, and never touches an edited or duplicated example', async () => {
    const { cards } = await setup();
    expect(await restoreExamples(cards)).toBe(0);
    const dog = (await cards.list()).find((c) => c.exampleKey === 'dog')!;
    const peanut = (await cards.list()).find((c) => c.exampleKey === 'peanut')!;
    await cards.update(dog.id, { label: 'My renamed dog card', showLabel: false, categoryId: 'pets', favourite: false, photoFile: null, thumbFile: null, item: dog.item });
    await cards.delete(peanut.id);
    expect(await restoreExamples(cards)).toBe(1);
    const list = await cards.list();
    expect(list).toHaveLength(3);
    expect(list.find((c) => c.exampleKey === 'peanut')).toMatchObject({ favourite: true, label: "No peanuts, I'm allergic" });
    expect(list.find((c) => c.exampleKey === 'dog')!.label).toBe('My renamed dog card');
    expect(await restoreExamples(cards)).toBe(0);
  });
});
