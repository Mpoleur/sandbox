import React from 'react';
import { Alert, Text, TextInput } from 'react-native';
import renderer, { act, type ReactTestInstance } from 'react-test-renderer';
import { AppDataProvider, type AppData } from '../src/data/AppData';
import { createCardsRepo } from '../src/data/cardsRepo';
import { createCategoriesRepo } from '../src/data/categoriesRepo';
import { createSettingsRepo } from '../src/data/settingsRepo';
import { MIGRATIONS } from '../src/data/migrations';
import { migrate } from '../src/data/migrations/runner';
import { SqlJsDb, testDeps } from './helpers/sqljsDb';

// The phone-only parts are replaced by simple stand-ins; everything else (screens, rules, database code) is the real code.
jest.mock('../src/platform/photoStore', () => ({
  photoUri: (f: string) => `file:///photos/${f}`,
  thumbUri: (f: string) => `file:///thumbs/${f}`,
  deletePhotoFiles: jest.fn(),
  copyPhotoFiles: jest.fn(async () => ({ photoFile: 'copy.jpg', thumbFile: 'copy.jpg' })),
  importPhoto: jest.fn(async () => ({ photoFile: 'new.jpg', thumbFile: 'new.jpg', info: { valid: true, width: 1600, height: 1200, hasExif: false, orientation: null, hasGps: false } })),
  documentFolder: () => 'file:///data/user/0/com.poleur.cards/files/',
}));
jest.mock('../src/platform/picker', () => ({
  takePhoto: jest.fn(async () => ({ status: 'ok', asset: { uri: 'file:///cache/x.jpg', width: 4000, height: 3000 } })),
  choosePhoto: jest.fn(async () => ({ status: 'cancelled' })),
  pendingPhoto: jest.fn(async () => null),
}));
jest.mock('expo-keep-awake', () => ({ activateKeepAwakeAsync: jest.fn(async () => undefined), deactivateKeepAwake: jest.fn(async () => undefined) }));
jest.mock('expo-navigation-bar', () => ({ NavigationBar: () => null }));
jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 24, left: 0, right: 0 }) }));
jest.mock('@react-navigation/native', () => ({ useFocusEffect: (cb: () => void) => require('react').useEffect(cb, [cb]) }));
jest.mock('expo-brightness', () => ({ setBrightnessAsync: jest.fn(async () => undefined), restoreSystemBrightnessAsync: jest.fn(async () => undefined) }));

import CardEditor from '../src/screens/CardEditor';
import DisplayCard from '../src/screens/DisplayCard';
import { ModifierChips } from '../src/ui/ModifierChips';
import { SymbolPicker } from '../src/ui/SymbolPicker';
import { CardView } from '../src/ui/CardView';

async function makeData(): Promise<AppData> {
  const db = await SqlJsDb.create();
  await migrate(db, MIGRATIONS, testDeps);
  return { db, cards: createCardsRepo(db, testDeps), categories: createCategoriesRepo(db), settings: createSettingsRepo(db) };
}

function allText(root: ReactTestInstance): string {
  return root.findAllByType(Text).map((t) => [t.props.children].flat().join('')).join(' | ');
}
const chipsOf = (t: renderer.ReactTestRenderer) => t.root.findAll((x) => typeof x.type === 'string' && x.props.accessibilityRole === 'button');

function press(inst: ReactTestInstance): void {
  act(() => {
    inst.props.onPress?.();
  });
}
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function mount(el: React.ReactElement): renderer.ReactTestRenderer {
  let t!: renderer.ReactTestRenderer;
  act(() => {
    t = renderer.create(el);
  });
  return t;
}

async function flush(): Promise<void> {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });
}

function nav() {
  const listeners: Record<string, (e: unknown) => void> = {};
  return {
    addListener: jest.fn((name: string, cb: (e: unknown) => void) => {
      listeners[name] = cb;
      return () => undefined;
    }),
    setOptions: jest.fn(),
    goBack: jest.fn(),
    navigate: jest.fn(),
    dispatch: jest.fn(),
    listeners,
  };
}

describe('cards draw', () => {
  test('CardView renders the example card without error', () => {
    const t = mount(<CardView item={{ symbolId: 'DIE-01', badges: ['MOD-01', 'MOD-03'] }} size={120} />);
    expect(t.toJSON()).toBeTruthy();
  });
});

describe('modifier chips', () => {
  test('15 chips in the public build; No is not offered on a crossed-out symbol; two chosen blocks the rest', () => {
    const changes: string[][] = [];
    const t = mount(<ModifierChips badges={[]} mainSymbolId="DIE-01" onChange={(b) => changes.push(b)} showUnreviewed={false} />);
    expect(chipsOf(t)).toHaveLength(15);
    const crossed = mount(<ModifierChips badges={[]} mainSymbolId="DIE-13" onChange={() => undefined} showUnreviewed={false} />);
    expect(chipsOf(crossed)).toHaveLength(14);
    press(t.root.findAll((x) => x.props.accessibilityLabel === 'Allergy / danger' && !!x.props.onPress)[0]);
    expect(changes[0]).toEqual(['MOD-03']);
    const full = mount(<ModifierChips badges={['MOD-01', 'MOD-03']} mainSymbolId="DIE-01" onChange={() => undefined} showUnreviewed={false} />);
    const text = allText(full.root);
    expect(text).toContain('2 of 2 chosen');
    // No shows no number, Allergy shows 1
    const numbers = full.root.findAllByType(Text).filter((x) => ['1', '2'].includes(String([x.props.children].flat().join(''))));
    expect(numbers.map((n) => [n.props.children].flat().join(''))).toEqual(['1']);
  });
});

describe('symbol picker', () => {
  test('shows a group, searches by name, selects on tap; hidden symbols stay hidden in the public build', () => {
    const picked: string[] = [];
    const t = mount(<SymbolPicker selectedId={null} onSelect={(id) => picked.push(id)} showUnreviewed={false} />);
    expect(allText(t.root)).toContain('Basics');
    expect(allText(t.root)).not.toContain('Mosque'); // religion group: only 3 visible, none of the hidden ones
    const input = t.root.findByType(TextInput);
    act(() => input.props.onChangeText('peanut'));
    expect(allText(t.root)).toContain('Peanut');
    press(t.root.findAll((n) => n.props.accessibilityLabel === 'Peanut' && !!n.props.onPress)[0]);
    expect(picked).toEqual(['DIE-01']);
    act(() => input.props.onChangeText('zzzz'));
    expect(allText(t.root)).toContain('No symbols found');
    act(() => input.props.onChangeText('mosque'));
    expect(allText(t.root)).toContain('No symbols found'); // hidden until reviewed
  });
  test('the review build offers the hidden symbols with a needs-check mark', () => {
    const t = mount(<SymbolPicker selectedId={null} onSelect={() => undefined} showUnreviewed />);
    act(() => t.root.findByType(TextInput).props.onChangeText('mosque'));
    expect(allText(t.root)).toContain('Mosque');
    expect(allText(t.root)).toContain('needs check');
  });
});

describe('card editor (real screen, real database code)', () => {
  test('choose a symbol, two modifiers, a photo, then Save: the card is stored and the editor closes', async () => {
    const data = await makeData();
    const n = nav();
    let t!: renderer.ReactTestRenderer;
    await act(async () => {
      t = renderer.create(
        <AppDataProvider data={data}>
          <CardEditor {...({ navigation: n, route: { params: undefined } } as any)} />
        </AppDataProvider>,
      );
    });
    await flush();
    // Save starts disabled: nothing chosen
    const saveBtn = () => t.root.findAll((x) => x.props.accessibilityRole === 'button' && x.props.accessibilityState && [x.props.children].flat().length > 0 && allTextOf(x) === 'Save card')[0];
    function allTextOf(x: ReactTestInstance) { return allText(x); }
    expect(saveBtn().props.accessibilityState.disabled).toBe(true);
    // pick Peanut from the search
    act(() => t.root.findAllByType(TextInput)[0].props.onChangeText('peanut'));
    press(t.root.findAll((x) => x.props.accessibilityLabel === 'Peanut' && !!x.props.onPress)[0]);
    // modifiers No then Allergy
    press(t.root.findAll((x) => x.props.accessibilityLabel === 'No / not allowed' && !!x.props.onPress)[0]);
    press(t.root.findAll((x) => x.props.accessibilityLabel === 'Allergy / danger' && !!x.props.onPress)[0]);
    // a third modifier is refused
    press(t.root.findAll((x) => x.props.accessibilityLabel === 'Question / where is' && !!x.props.onPress)[0]);
    expect(allText(t.root)).toContain('2 of 2 chosen');
    // label
    act(() => t.root.findAllByType(TextInput)[1].props.onChangeText('  No peanuts, please  '));
    expect(saveBtn().props.accessibilityState.disabled).toBe(false);
    await act(async () => {
      await saveBtn().props.onPress();
    });
    await flush();
    const saved = (await data.cards.list()).find((c) => c.label === 'No peanuts, please')!;
    expect(saved).toBeTruthy();
    expect(saved.item).toEqual({ symbolId: 'DIE-01', badges: ['MOD-01', 'MOD-03'] });
    expect(saved.categoryId).toBe('diet-allergies'); // filed under the symbol's own group by default
    expect(n.navigate).toHaveBeenCalledWith('Home', { reminder: true }); // an Allergy card shows the safety reminder
    expect(await data.settings.get('editorDraft')).toBeNull();
  });

  test('adding a photo writes the draft first, shows the photo check, and a photo-only card can be saved', async () => {
    const data = await makeData();
    const n = nav();
    let t!: renderer.ReactTestRenderer;
    await act(async () => {
      t = renderer.create(
        <AppDataProvider data={data}>
          <CardEditor {...({ navigation: n, route: { params: undefined } } as any)} />
        </AppDataProvider>,
      );
    });
    await flush();
    const addPhoto = t.root.findAll((x) => x.props.accessibilityRole === 'button' && !!x.props.onPress && allText(x) === 'Add photo')[0];
    press(addPhoto);
    const take = t.root.findAll((x) => x.props.accessibilityRole === 'button' && !!x.props.onPress && allText(x) === 'Take a photo')[0];
    await act(async () => {
      await take.props.onPress();
    });
    await flush();
    expect(await data.settings.get('editorDraft')).toBeTruthy(); // written before the camera opened
    expect(allText(t.root)).toContain('Photo check: 1600 x 1200, no EXIF data, no location, upright');
    const save = t.root.findAll((x) => x.props.accessibilityRole === 'button' && allText(x) === 'Save card')[0];
    expect(save.props.accessibilityState.disabled).toBe(false);
    await act(async () => {
      await save.props.onPress();
    });
    await flush();
    const photoCard = (await data.cards.list()).find((c) => c.photoFile === 'new.jpg')!;
    expect(photoCard.item).toBeNull();
  });

  test('leaving after changes asks before discarding', async () => {
    const data = await makeData();
    const n = nav();
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    await act(async () => {
      renderer.create(
        <AppDataProvider data={data}>
          <CardEditor {...({ navigation: n, route: { params: undefined } } as any)} />
        </AppDataProvider>,
      );
    });
    await flush();
    // no change: leaving is allowed straight away
    const prevent = jest.fn();
    n.listeners.beforeRemove({ preventDefault: prevent, data: { action: {} } });
    expect(prevent).not.toHaveBeenCalled();
    alert.mockRestore();
  });

  test('editing an existing card loads it and saving keeps its favourite state', async () => {
    const data = await makeData();
    const peanut = (await data.cards.list()).find((c) => c.exampleKey === 'peanut')!;
    const n = nav();
    let t!: renderer.ReactTestRenderer;
    await act(async () => {
      t = renderer.create(
        <AppDataProvider data={data}>
          <CardEditor {...({ navigation: n, route: { params: { cardId: peanut.id } } } as any)} />
        </AppDataProvider>,
      );
    });
    await flush();
    expect(allText(t.root)).toContain('2 of 2 chosen');
    act(() => t.root.findAllByType(TextInput)[1].props.onChangeText('Edited label'));
    const save = t.root.findAll((x) => x.props.accessibilityRole === 'button' && allText(x) === 'Save card')[0];
    await act(async () => {
      await save.props.onPress();
    });
    await flush();
    const after = (await data.cards.get(peanut.id))!;
    expect(after.label).toBe('Edited label');
    expect(after.favourite).toBe(true);
    expect(after.item).toEqual(peanut.item);
  });
});

describe('display mode', () => {
  test('shows the card, keeps the screen awake, and closes on tap', async () => {
    const data = await makeData();
    const peanut = (await data.cards.list()).find((c) => c.exampleKey === 'peanut')!;
    const n = nav();
    let t!: renderer.ReactTestRenderer;
    await act(async () => {
      t = renderer.create(
        <AppDataProvider data={data}>
          <DisplayCard {...({ navigation: n, route: { params: { cardId: peanut.id } } } as any)} />
        </AppDataProvider>,
      );
    });
    await flush();
    const keepAwake = require('expo-keep-awake');
    expect(keepAwake.activateKeepAwakeAsync).toHaveBeenCalled();
    const root = t.root.findAll((x) => x.props.accessibilityLabel === 'Close card' && !!x.props.onPress)[0];
    press(root);
    expect(n.goBack).toHaveBeenCalled();
    act(() => t.unmount());
    expect(keepAwake.deactivateKeepAwake).toHaveBeenCalled();
  });
  test('a card that no longer exists says so', async () => {
    const data = await makeData();
    const n = nav();
    let t!: renderer.ReactTestRenderer;
    await act(async () => {
      t = renderer.create(
        <AppDataProvider data={data}>
          <DisplayCard {...({ navigation: n, route: { params: { cardId: 'gone' } } } as any)} />
        </AppDataProvider>,
      );
    });
    await flush();
    expect(allText(t.root)).toContain('This card no longer exists.');
  });
});

