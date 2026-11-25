import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { SVG_FOLDER_HASH, SYMBOL_SHAPES, type Shape } from '../src/generated/symbols.generated';
import { ALL_SYMBOLS } from '../src/core/catalog';

const SVG_DIR = path.join(__dirname, '..', '..', 'assets', 'symbols');

// --- an independent, deliberately simple reader of the original files (does not share code with the converter) ---
interface Node { tag: string; attrs: Record<string, string>; kids: Node[] }

function parseSvg(src: string): { root: Record<string, string>; kids: Node[] } {
  const re = /<(\/?)([a-zA-Z]+)((?:\s+[a-zA-Z:-]+="[^"]*")*)\s*(\/?)>/g;
  const stack: Node[] = [];
  let top: Node | undefined;
  let rootAttrs: Record<string, string> = {};
  const roots: Node[] = [];
  for (const m of src.matchAll(re)) {
    const [, close, tag, rawAttrs, selfClose] = m;
    if (close) { stack.pop(); continue; }
    const attrs: Record<string, string> = {};
    for (const a of rawAttrs.matchAll(/([a-zA-Z:-]+)="([^"]*)"/g)) attrs[a[1]] = a[2];
    if (tag === 'svg') { rootAttrs = attrs; stack.push({ tag, attrs, kids: [] }); continue; }
    const node: Node = { tag, attrs, kids: [] };
    top = stack[stack.length - 1];
    if (top && top.tag !== 'svg') top.kids.push(node); else roots.push(node);
    if (!selfClose) stack.push(node);
  }
  return { root: rootAttrs, kids: roots };
}

type Pt = [number, number];
function applyTransformText(t: string, p: Pt): Pt {
  // SVG applies the list left to right as nested transforms, so the last function acts on the point first.
  const fns = [...t.matchAll(/([a-zA-Z]+)\(([^)]*)\)/g)].map((m) => ({ fn: m[1], v: m[2].split(/[\s,]+/).filter(Boolean).map(Number) }));
  let [x, y] = p;
  for (const { fn, v } of fns.reverse()) {
    if (fn === 'translate') { x += v[0]; y += v[1] ?? 0; }
    else if (fn === 'scale') { x *= v[0]; y *= v[1] ?? v[0]; }
    else if (fn === 'rotate') {
      const [a, cx = 0, cy = 0] = v; const r = (a * Math.PI) / 180;
      const dx = x - cx, dy = y - cy;
      x = cx + dx * Math.cos(r) - dy * Math.sin(r); y = cy + dx * Math.sin(r) + dy * Math.cos(r);
    } else if (fn === 'matrix') { const [a, b, c, d, e, f] = v; [x, y] = [a * x + c * y + e, b * x + d * y + f]; }
    else throw new Error('unsupported ' + fn);
  }
  return [x, y];
}

const CAMEL: Record<string, string> = { 'stroke-width': 'strokeWidth', 'stroke-linecap': 'strokeLinecap', 'stroke-linejoin': 'strokeLinejoin', 'stroke-dasharray': 'strokeDasharray' };

function compare(orig: Node, gen: Shape, where: string): void {
  const [tag, props, kids] = gen;
  expect([where, tag]).toEqual([where, orig.tag]);
  for (const [k, v] of Object.entries(orig.attrs)) {
    if (k === 'transform') {
      for (const p of [[10, 20], [-3.5, 41]] as Pt[]) {
        const want = applyTransformText(v, p);
        const [a, b, c, d, e, f] = props.transform as number[];
        const got: Pt = [a * p[0] + c * p[1] + e, b * p[0] + d * p[1] + f];
        expect(got[0]).toBeCloseTo(want[0], 4); expect(got[1]).toBeCloseTo(want[1], 4);
      }
    } else if (k === 'stroke-dasharray') {
      expect(props.strokeDasharray).toEqual(v.split(/[\s,]+/).map(Number));
    } else {
      expect([where, k, props[CAMEL[k] ?? k]]).toEqual([where, k, v]);
    }
  }
  const nOrig = Object.keys(orig.attrs).length;
  expect([where, Object.keys(props).length]).toEqual([where, nOrig]); // nothing added, nothing lost
  expect([where, kids.length]).toEqual([where, orig.kids.length]);
  kids.forEach((k, i) => compare(orig.kids[i], k, `${where}.${i}`));
}

describe('generated symbol drawings', () => {
  test('the generated file matches the artwork folder (run tools/build_symbols.py if this fails)', () => {
    const h = crypto.createHash('sha256');
    for (const f of fs.readdirSync(SVG_DIR).filter((x) => x.endsWith('.svg')).sort()) {
      h.update(f); h.update(fs.readFileSync(path.join(SVG_DIR, f)));
    }
    expect(SVG_FOLDER_HASH).toBe(h.digest('hex'));
  });
  test('all 168 catalogue symbols have shapes, and nothing else does', () => {
    expect(Object.keys(SYMBOL_SHAPES).sort()).toEqual(ALL_SYMBOLS.map((s) => s.id).sort());
  });
  test('only the six element types of the artwork occur', () => {
    const tags = new Set<string>();
    const walk = (s: Shape) => { tags.add(s[0]); s[2].forEach(walk); };
    Object.values(SYMBOL_SHAPES).forEach((l) => l.forEach(walk));
    expect([...tags].sort()).toEqual(['circle', 'ellipse', 'g', 'path', 'rect']);
  });
  test('the conversion is lossless for every one of the 168 files (independent reader)', () => {
    for (const s of ALL_SYMBOLS) {
      const parsed = parseSvg(fs.readFileSync(path.join(SVG_DIR, s.id + '.svg'), 'utf8'));
      expect(parsed.root['viewBox']).toBe('0 0 64 64');
      const gen = SYMBOL_SHAPES[s.id];
      expect(gen).toHaveLength(parsed.kids.length);
      gen.forEach((g, i) => compare(parsed.kids[i], g, `${s.id}.${i}`));
    }
  });
});
