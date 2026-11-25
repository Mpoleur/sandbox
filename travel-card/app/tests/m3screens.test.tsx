import React from 'react';
import { Alert, Switch, Text, TextInput } from 'react-native';
import renderer, { act, type ReactTestInstance } from 'react-test-renderer';
import { AppDataProvider, type AppData } from '../src/data/AppData';
import { createCardsRepo } from '../src/data/cardsRepo';
import { createCategoriesRepo } from '../src/data/categoriesRepo';
import { createSettingsRepo } from '../src/data/settingsRepo';
import { MIGRATIONS } from '../src/data/migrations';
import { migrate } from '../src/data/migrations/runner';
import { SqlJsDb, testDeps } from './helpers/sqljsDb';

jest.mock('../src/platform/photoStore', () => ({
  photoUri: (f: string) => `file:///photos/${f}`,
  thumbUri: (f: string) => `file:///thumbs/${f}`,
  deletePhotoFiles: jest.fn(),
  copyPhotoFiles: jest.fn(async () => ({ photoFile: 'copy.jpg', thumbFile: 'copy.jpg' })),
}));
jest.mock('expo-keep-awake', () => ({ activateKeepAwakeAsync: jest.fn(async () => undefined), deactivateKeepAwake: jest.fn(async () => undefined) }));
jest.mock('expo-navigation-bar', () => ({ NavigationBar: () => null }));
jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));
jest.mock('../src/ui/StampLayer', () => ({ StampLayer: () => null }));
jest.mock('expo-brightness', () => ({ setBrightnessAsync: jest.fn(async () => undefined), restoreSystemBrightnessAsync: jest.fn(async () => undefined) }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 24, left: 0, right: 0 }) }));
jest.mock('@react-navigation/native', () => ({ useFocusEffect: (cb: () => void) => require('react').useEffect(cb, [cb]) }));

import Categories from '../src/screens/Categories';
import DisplayCard from '../src/screens/DisplayCard';
import Home from '../src/screens/Home';
import Reorder from '../src/screens/Reorder';
import Safety from '../src/screens/Safety';
import Settings from '../src/screens/Settings';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

async function makeData(): Promise<AppData> {
  const db = await SqlJsDb.create();
  await migrate(db, MIGRATIONS, testDeps);
  let n = 0;
  return { db, cards: createCardsRepo(db, testDeps), categories: createCategoriesRepo(db, { newId: () => `c_${++n}` }), settings: createSettingsRepo(db) };
}

const allText = (root: ReactTestInstance) => root.findAllByType(Text).map((x) => [x.props.children].flat().join('')).join(' | ');
const press = (inst: ReactTestInstance) => act(() => { inst.props.onPress?.(); });
const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 0)); });
const button = (t: renderer.ReactTestRenderer, label: string) => t.root.findAll((x) => x.props.accessibilityRole === 'button' && !!x.props.onPress && allText(x) === label)[0];

function nav() {
  return { addListener: jest.fn(() => () => undefined), setOptions: jest.fn(), setParams: jest.fn(), goBack: jest.fn(), navigate: jest.fn(), dispatch: jest.fn() };
}

async function mountWith(data: AppData, el: React.ReactElement): Promise<renderer.ReactTestRenderer> {
  let t!: renderer.ReactTestRenderer;
  await act(async () => {
    t = renderer.create(<AppDataProvider data={data}>{el}</AppDataProvider>);
  });
  await flush();
  return t;
}

const props = (n: ReturnType<typeof nav>, params?: unknown) => ({ navigation: n, route: { params } }) as any;

describe('home (milestone 3)', () => {
  test('favourites on top only, then categories with cards; New card, search, and the safety notice on first launch', async () => {
    const data = await makeData();
    const n = nav();
    const t = await mountWith(data, <Home {...props(n)} />);
    const text = allText(t.root);
    expect(text).toContain('Travel Cards');
    expect(text).toContain('Symbol card');
    expect(text).toContain('Favourites');
    expect(text).toContain("No peanuts, I'm allergic");
    expect(text).toContain('Places & directions');
    expect(text).toContain('Pets');
    expect(text).not.toContain('Diet & allergies');
    expect(n.navigate).toHaveBeenCalledWith('Safety', { firstRun: true });
    press(button(t, 'New card'));
    expect(n.navigate).toHaveBeenCalledWith('CardEditor', {});
    act(() => t.root.findAllByType(TextInput)[0].props.onChangeText('toilet'));
    expect(allText(t.root)).toContain('Where is the toilet?');
    expect(allText(t.root)).not.toContain('Can my dog come in?');
    act(() => t.root.findAllByType(TextInput)[0].props.onChangeText('qqq'));
    expect(allText(t.root)).toContain('No card matches your search.');
  });

  test('the safety notice is not shown again once accepted', async () => {
    const data = await makeData();
    await data.settings.set('safetyNoticeSeen', '1');
    const n = nav();
    await mountWith(data, <Home {...props(n)} />);
    expect(n.navigate).not.toHaveBeenCalledWith('Safety', expect.anything());
  });

  test('the allergy reminder shows after saving, and can be dismissed', async () => {
    const data = await makeData();
    await data.settings.set('safetyNoticeSeen', '1');
    const n = nav();
    const t = await mountWith(data, <Home {...props(n, { reminder: true })} />);
    expect(allText(t.root)).toContain('verify with a local or a professional');
    press(button(t, 'Dismiss'));
    expect(allText(t.root)).not.toContain('verify with a local or a professional');
  });

  test('the long-press menu can star a card, which moves it to Favourites', async () => {
    const data = await makeData();
    await data.settings.set('safetyNoticeSeen', '1');
    const t = await mountWith(data, <Home {...props(nav())} />);
    const tile = t.root.findAll((x) => x.props.accessibilityLabel === 'Where is the toilet?' && !!x.props.onLongPress)[0];
    act(() => tile.props.onLongPress());
    await act(async () => {
      button(t, 'Add to favourites').props.onPress();
    });
    await flush();
    expect((await data.cards.list()).find((c) => c.exampleKey === 'toilet')!.favourite).toBe(true);
    expect(allText(t.root)).not.toContain('Places & directions');
  });

  test('the three-dot menu opens Reorder and Settings', async () => {
    const data = await makeData();
    await data.settings.set('safetyNoticeSeen', '1');
    const n = nav();
    const t = await mountWith(data, <Home {...props(n)} />);
    const more = () => t.root.findAll((x) => x.props.accessibilityLabel === 'More' && !!x.props.onPress)[0];
    act(() => more().props.onPress());
    await flush();
    press(button(t, 'Reorder cards'));
    expect(n.navigate).toHaveBeenCalledWith('Reorder');
    act(() => more().props.onPress());
    press(button(t, 'Settings'));
    expect(n.navigate).toHaveBeenCalledWith('Settings');
  });
});

describe('other screens', () => {
  test('Settings lists its rows, restores missing examples, and keeps the brightness choice (on by default)', async () => {
    const data = await makeData();
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    const t = await mountWith(data, <Settings {...props(nav())} />);
    const text = allText(t.root);
    for (const row of ['Categories', 'Restore example cards', 'Safety notice', 'About', 'Raise the brightness when a card is shown']) expect(text).toContain(row);
    const sw = t.root.findAllByType(Switch)[0];
    expect(sw.props.value).toBe(true);
    await act(async () => sw.props.onValueChange(false));
    expect(await data.settings.get('brightnessOnDisplay')).toBe('0');
    const dog = (await data.cards.list()).find((c) => c.exampleKey === 'dog')!;
    await data.cards.delete(dog.id);
    await act(async () => {
      await button(t, 'Restore example cards').props.onPress();
    });
    expect(alert).toHaveBeenCalledWith('1 example card was added back.');
    expect((await data.cards.list()).some((c) => c.exampleKey === 'dog')).toBe(true);
    alert.mockRestore();
  });

  test('Categories: 13 defaults with switches, hiding one is stored', async () => {
    const data = await makeData();
    const t = await mountWith(data, <Categories />);
    expect(t.root.findAllByType(Switch)).toHaveLength(13);
    await act(async () => t.root.findAllByType(Switch)[0].props.onValueChange(false));
    expect((await data.categories.list())[0].hidden).toBe(true);
    expect(allText(t.root)).toContain('You have not made a category yet.');
  });

  test('Safety: first launch cannot be left except by the button, which remembers the choice', async () => {
    const data = await makeData();
    const n = nav();
    const t = await mountWith(data, <Safety {...props(n, { firstRun: true })} />);
    expect(allText(t.root)).toContain('A communication aid, not a medical tool');
    expect(n.setOptions).toHaveBeenCalledWith({ headerBackVisible: false, gestureEnabled: false });
    await act(async () => {
      await button(t, 'I understand').props.onPress();
    });
    expect(await data.settings.get('safetyNoticeSeen')).toBe('1');
    expect(n.goBack).toHaveBeenCalled();
  });

  test('Reorder: arrows move a card inside its own list', async () => {
    const data = await makeData();
    const mk = (label: string, sym: string) => data.cards.create({ label, showLabel: false, categoryId: 'basics', favourite: false, photoFile: null, thumbFile: null, item: { symbolId: sym, badges: [] } });
    await mk('first', 'BAS-01');
    await mk('second', 'BAS-02');
    const t = await mountWith(data, <Reorder />);
    const down = t.root.findAll((x) => x.props.accessibilityLabel === 'Move down: first' && !!x.props.onPress)[0];
    await act(async () => {
      await down.props.onPress();
    });
    await flush();
    expect((await data.cards.list()).filter((c) => c.categoryId === 'basics').map((c) => c.label)).toEqual(['second', 'first']);
  });

  test('display mode raises brightness unless switched off, and hands it back on close', async () => {
    const data = await makeData();
    const card = (await data.cards.list())[0];
    const b = require('expo-brightness');
    b.setBrightnessAsync.mockClear();
    const t = await mountWith(data, <DisplayCard {...props(nav(), { cardId: card.id })} />);
    expect(b.setBrightnessAsync).toHaveBeenCalledWith(1);
    act(() => t.unmount());
    expect(b.restoreSystemBrightnessAsync).toHaveBeenCalled();
    await data.settings.set('brightnessOnDisplay', '0');
    b.setBrightnessAsync.mockClear();
    await mountWith(data, <DisplayCard {...props(nav(), { cardId: card.id })} />);
    expect(b.setBrightnessAsync).not.toHaveBeenCalled();
  });
});
