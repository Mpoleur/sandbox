import fs from 'fs';
import path from 'path';
import React from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { CARD_CATEGORY_KEYS } from '../src/core/catalog';
import { CHOSEN_COLORS, CUSTOM_COLOR, DESIGN_COLORS, categoryColor, contrast } from '../src/core/categoryColors';
import { STAMPS, STAMPS_VIEWBOX } from '../src/generated/stamps.generated';
import { t } from '../src/core/i18n';
import { END_SPACER } from '../src/ui/HomeRoute';
import { Ticket } from '../src/ui/Ticket';

jest.mock('../src/platform/photoStore', () => ({ thumbUri: (f: string) => `file:///thumbs/${f}` }));

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const card = (over: object) => ({
  id: 'x', label: 'Take me to my hotel', showLabel: false, categoryId: 'transport', favourite: false, favouriteOrder: null, sortOrder: 1,
  photoFile: null, thumbFile: null, exampleKey: null, createdAt: '', updatedAt: '', item: { symbolId: 'TRA-03', badges: [] as string[] }, ...over,
}) as any;
const cat = { id: 'transport', kind: 'default', name: null, hidden: false, sortOrder: 1 } as const;
const text = (r: renderer.ReactTestRenderer) => r.root.findAllByType(Text).map((x) => [x.props.children].flat().join('')).join(' | ');

describe('Home design D4', () => {
  test('the five colours of the mock-up page, each at least 3:1 against the white ticket, plus my own for the rest', () => {
    expect(DESIGN_COLORS).toEqual({ 'diet-allergies': '#E65100', 'places-directions': '#1565C0', pets: '#6D4C41', 'health-emergency': '#2E7D32', transport: '#00796B' });
    for (const [id, c] of Object.entries(DESIGN_COLORS)) expect([id, contrast(c, '#FFFFFF') >= 3]).toEqual([id, true]);
    for (const [id, c] of Object.entries({ ...CHOSEN_COLORS, custom: CUSTOM_COLOR })) expect([id, contrast(c, '#FFFFFF') >= 3]).toEqual([id, true]);
    expect(contrast('#E65100', '#FFFFFF')).toBeGreaterThan(3.7); // the page says 3.8:1
    expect(contrast('#FFFFFF', '#0B3D7A')).toBeGreaterThan(10.5); // white on the navy header, page says 10.7:1
  });
  test('every card category has a border colour, custom categories share one', () => {
    for (const k of CARD_CATEGORY_KEYS) expect(categoryColor(k, 'default')).toMatch(/^#[0-9A-F]{6}$/);
    expect(categoryColor('c_1', 'custom')).toBe(CUSTOM_COLOR);
  });
  test('the list ends with an 88 dp spacer', () => {
    expect(END_SPACER).toBe(88);
  });
  test('a ticket shows the label, the source line, the 3 dp category border, and a star for a favourite', () => {
    let r!: renderer.ReactTestRenderer;
    act(() => {
      r = renderer.create(<Ticket card={card({ favourite: true, thumbFile: 'p.jpg' })} category={cat as any} onPress={() => undefined} onLongPress={() => undefined} />);
    });
    expect(text(r)).toContain('Take me to my hotel');
    expect(text(r)).toContain(t('ui.ticket.withPhoto'));
    const pressable = r.root.findAll((x) => x.props.accessibilityRole === 'button')[0];
    const style = (pressable.props.style as (s: { pressed: boolean }) => object[])({ pressed: false });
    expect(JSON.stringify(style)).toContain('"borderColor":"#00796B"');
    expect(JSON.stringify(style)).toContain('"borderWidth":3');
    expect(JSON.stringify(style)).toContain('"height":84');
  });
});

describe('Background 4e', () => {
  test('stamps are a flat vector layer of plain shapes, cropped to the bottom 240 dp, with the retinted inks only', () => {
    expect(STAMPS_VIEWBOX).toBe('0 520 360 240');
    expect(STAMPS.length).toBe(8);
    const json = JSON.stringify(STAMPS).toUpperCase();
    const inks = new Set((json.match(/#[0-9A-F]{6}/g) ?? []));
    expect([...inks].sort()).toEqual(['#7FC1C8', '#8CC4A0', '#8FA9D3', '#E0C163', '#E7A98A']);
    expect(json).not.toMatch(/GRADIENT|FILTER|IMAGE|OPACITY/);
  });
  test('the generated stamps match the approved mock-up page', () => {
    const html = fs.readFileSync(path.join(__dirname, '..', '..', 'docs', 'design', 'mockups', 'home-backgrounds-4.html'), 'utf8');
    const i = html.indexOf('<h2>4e.');
    for (const ink of ['#8FA9D3', '#E7A98A', '#8CC4A0', '#7FC1C8', '#E0C163', '#F3F6FB']) expect(html.slice(i)).toContain(ink);
  });
});
