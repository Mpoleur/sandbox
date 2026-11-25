import { chipState, chooseMainSymbol, defaultCategoryFor, toggleBadge } from '../src/core/editorModel';
import { parseDraft, serializeDraft, type EditorDraft } from '../src/core/draft';
import { computeDisplayLayout } from '../src/core/displayLayout';
import { inspectJpeg } from '../src/core/jpegInfo';
import { isPhotoFileName, orphanFiles } from '../src/core/photoCleanup';
import { validateCard } from '../src/core/cardRules';

describe('editor model: modifier chips (App Style Sheet 5)', () => {
  test('tapping adds up to two, then the others are blocked; tapping a chosen one removes it', () => {
    let b: string[] = [];
    b = toggleBadge(b, 'MOD-03', 'DIE-01');
    b = toggleBadge(b, 'MOD-04', 'DIE-01');
    expect(b).toEqual(['MOD-03', 'MOD-04']);
    expect(chipState(b, 'MOD-05', 'DIE-01')).toBe('blocked');
    expect(toggleBadge(b, 'MOD-05', 'DIE-01')).toEqual(b);
    expect(chipState(b, 'MOD-03', 'DIE-01')).toBe('selected');
    expect(toggleBadge(b, 'MOD-03', 'DIE-01')).toEqual(['MOD-04']);
  });
  test('No is not offered on the six crossed-out symbols, and is offered elsewhere', () => {
    for (const id of ['DIE-13', 'MON-08', 'REL-01', 'REL-04', 'REL-05', 'REL-06']) {
      expect(chipState([], 'MOD-01', id)).toBe('no-unavailable');
      expect(toggleBadge([], 'MOD-01', id)).toEqual([]);
    }
    expect(chipState([], 'MOD-01', 'DIE-01')).toBe('available');
    expect(chipState([], 'MOD-01', null)).toBe('available');
  });
  test('changing to a crossed-out main symbol removes No and says so; other badges stay', () => {
    expect(chooseMainSymbol(['MOD-01', 'MOD-03'], 'DIE-13')).toEqual({ badges: ['MOD-03'], noRemoved: true });
    expect(chooseMainSymbol(['MOD-01', 'MOD-03'], 'DIE-02')).toEqual({ badges: ['MOD-01', 'MOD-03'], noRemoved: false });
    expect(chooseMainSymbol(['MOD-03'], 'DIE-13')).toEqual({ badges: ['MOD-03'], noRemoved: false });
  });
  test('default category is the library group of the symbol; never the Modifiers group', () => {
    expect(defaultCategoryFor('DIE-01', 'basics')).toBe('diet-allergies');
    expect(defaultCategoryFor('MOD-03', 'basics')).toBe('basics');
    expect(defaultCategoryFor(null, 'basics')).toBe('basics');
  });
});

describe('card input rules', () => {
  const base = { label: '', showLabel: false, categoryId: 'basics', favourite: false, photoFile: null, thumbFile: null, item: null };
  test('empty card, half a photo, and a good card', () => {
    expect(validateCard(base)).toContain('empty');
    expect(validateCard({ ...base, photoFile: 'p.jpg' })).toContain('photo-incomplete');
    expect(validateCard({ ...base, item: { symbolId: 'DIE-01', badges: [] } })).toEqual([]);
    expect(validateCard({ ...base, photoFile: 'p.jpg', thumbFile: 't.jpg' })).toEqual([]);
  });
});

describe('editor draft (restored after Android closes the app)', () => {
  const d: EditorDraft = { cardId: 'new', symbolId: 'DIE-01', badges: ['MOD-01'], label: 'x', showLabel: true, categoryId: 'pets', categoryTouched: true, photoFile: 'a.jpg', thumbFile: 'b.jpg' };
  test('round trip', () => {
    expect(parseDraft(serializeDraft(d))).toEqual(d);
  });
  test('damaged or missing drafts give null, never a crash', () => {
    expect(parseDraft(null)).toBeNull();
    expect(parseDraft('')).toBeNull();
    expect(parseDraft('{not json')).toBeNull();
    expect(parseDraft('{"cardId":5}')).toBeNull();
    expect(parseDraft(JSON.stringify({ ...d, badges: [1] }))).toBeNull();
  });
});

describe('display layout (App Style Sheet 6)', () => {
  const sizes = { phone: [360, 780], phoneLand: [780, 360], tablet: [800, 1280], tabletLand: [1280, 800] };
  test('symbol only: the largest square with an 8 dp margin, centred', () => {
    const p = computeDisplayLayout({ width: 360, height: 780, hasSymbol: true, hasPhoto: false, showLabel: false });
    expect(p.card).toEqual({ x: 8, y: 218, w: 344, h: 344 });
    const l = computeDisplayLayout({ width: 780, height: 360, hasSymbol: true, hasPhoto: false, showLabel: false });
    expect(l.card).toEqual({ x: 218, y: 8, w: 344, h: 344 });
  });
  test('the label reduces the square and sits under it', () => {
    const l = computeDisplayLayout({ width: 780, height: 360, hasSymbol: true, hasPhoto: false, showLabel: true });
    expect(l.card!.h).toBe(360 - 16 - 36);
    expect(l.label!.y).toBeCloseTo(l.card!.y + l.card!.h);
  });
  test('photo only fills the window', () => {
    expect(computeDisplayLayout({ width: 360, height: 780, hasSymbol: false, hasPhoto: true, showLabel: true })).toEqual({ kind: 'photo', photo: { x: 0, y: 0, w: 360, h: 780 } });
  });
  test('symbol and photo, portrait: square of width minus 32 on top, photo 12 dp below, filling the rest', () => {
    const p = computeDisplayLayout({ width: 360, height: 780, hasSymbol: true, hasPhoto: true, showLabel: false });
    expect(p.card).toEqual({ x: 16, y: 16, w: 328, h: 328 });
    expect(p.photo).toEqual({ x: 16, y: 356, w: 328, h: 780 - 356 - 16 });
  });
  test('symbol and photo, landscape: card left, photo right, nothing overlaps or leaves the window', () => {
    for (const [w, h] of [sizes.phoneLand, sizes.tabletLand]) {
      const l = computeDisplayLayout({ width: w, height: h, hasSymbol: true, hasPhoto: true, showLabel: true });
      expect(l.card!.x + l.card!.w).toBeLessThanOrEqual(l.photo!.x);
      expect(l.photo!.x + l.photo!.w).toBeLessThanOrEqual(w);
      expect(l.card!.y).toBeGreaterThanOrEqual(0);
      expect(l.card!.y + l.card!.h + l.label!.h).toBeLessThanOrEqual(h);
    }
  });
  test('every layout stays inside the window on phone and tablet, both orientations', () => {
    for (const [w, h] of Object.values(sizes)) {
      for (const hasPhoto of [false, true]) {
        for (const showLabel of [false, true]) {
          const l = computeDisplayLayout({ width: w, height: h, hasSymbol: true, hasPhoto, showLabel });
          for (const b of [l.card, l.photo, l.label]) {
            if (!b) continue;
            expect(b.x).toBeGreaterThanOrEqual(0);
            expect(b.y).toBeGreaterThanOrEqual(0);
            expect(b.x + b.w).toBeLessThanOrEqual(w + 0.001);
            expect(b.y + b.h).toBeLessThanOrEqual(h + 0.001);
            expect(b.w).toBeGreaterThan(0);
          }
        }
      }
    }
  });
});

describe('photo clean-up and file names', () => {
  test('files no card uses are leftovers', () => {
    expect(orphanFiles(['a.jpg', 'b.jpg', 'c.jpg'], new Set(['b.jpg']))).toEqual(['a.jpg', 'c.jpg']);
    expect(orphanFiles([], new Set())).toEqual([]);
  });
  test('only <uuid>.jpg names are ever deleted', () => {
    expect(isPhotoFileName('123e4567-e89b-12d3-a456-426614174000.jpg')).toBe(true);
    expect(isPhotoFileName('notes.txt')).toBe(false);
    expect(isPhotoFileName('../x.jpg')).toBe(false);
  });
});

function jpegWith(exif: { orientation?: number; gps?: boolean } | null): Uint8Array {
  const parts: number[] = [0xff, 0xd8];
  if (exif) {
    const entries: number[][] = [];
    const e = (tag: number, type: number, count: number, value: number) => [tag & 255, tag >> 8, type, 0, count, 0, 0, 0, value & 255, value >> 8, 0, 0];
    if (exif.orientation) entries.push(e(0x0112, 3, 1, exif.orientation));
    if (exif.gps) entries.push(e(0x8825, 4, 1, 100));
    const tiff = [0x49, 0x49, 0x2a, 0x00, 8, 0, 0, 0, entries.length & 255, 0, ...entries.flat(), 0, 0, 0, 0];
    const body = [0x45, 0x78, 0x69, 0x66, 0, 0, ...tiff];
    const len = body.length + 2;
    parts.push(0xff, 0xe1, len >> 8, len & 255, ...body);
  }
  // SOF0: 8 bit, height 480, width 640
  parts.push(0xff, 0xc0, 0, 17, 8, 0x01, 0xe0, 0x02, 0x80, 3, 1, 0x22, 0, 2, 0x11, 1, 3, 0x11, 1);
  parts.push(0xff, 0xda, 0, 2, 0xff, 0xd9);
  return Uint8Array.from(parts);
}

describe('JPEG reader for check C7', () => {
  test('a clean JPEG: valid, size read, no EXIF, no GPS, no rotation flag', () => {
    expect(inspectJpeg(jpegWith(null))).toEqual({ valid: true, width: 640, height: 480, hasExif: false, orientation: null, hasGps: false });
  });
  test('EXIF with a rotation flag and a GPS block is detected', () => {
    expect(inspectJpeg(jpegWith({ orientation: 6, gps: true }))).toMatchObject({ valid: true, hasExif: true, orientation: 6, hasGps: true, width: 640, height: 480 });
    expect(inspectJpeg(jpegWith({ orientation: 1 }))).toMatchObject({ hasExif: true, orientation: 1, hasGps: false });
  });
  test('not a JPEG', () => {
    expect(inspectJpeg(Uint8Array.from([1, 2, 3, 4, 5])).valid).toBe(false);
    expect(inspectJpeg(new Uint8Array(0)).valid).toBe(false);
  });
});
