import React from 'react';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { SYMBOL_SHAPES, type Shape } from '../generated/symbols.generated';
import type { Matrix } from '../core/compose';

const TAGS: Record<string, React.ElementType> = { path: Path, rect: Rect, circle: Circle, ellipse: Ellipse, g: G };

// The artwork files set round caps and joins on the <svg> root. They are passed to every shape here instead of
// relying on inheritance from the root, so the drawing does not depend on that library detail.
const ROUND = { strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

function renderShape(shape: Shape, key: string): React.ReactElement {
  const [tag, props, kids] = shape;
  const Tag = TAGS[tag];
  return (
    <Tag key={key} {...ROUND} {...props}>
      {kids.map((k, i) => renderShape(k, `${key}.${i}`))}
    </Tag>
  );
}

const CACHE = new Map<string, React.ReactElement[]>();

function elementsFor(id: string): React.ReactElement[] {
  let els = CACHE.get(id);
  if (!els) {
    const shapes = SYMBOL_SHAPES[id];
    // An ID unknown to the catalogue draws a neutral placeholder instead of crashing (Architecture 6.2).
    els = shapes
      ? shapes.map((s, i) => renderShape(s, `${id}.${i}`))
      : [<Rect key="ph" x="8" y="8" width="48" height="48" rx="8" fill="#ECEFF1" stroke="#90A4AE" strokeWidth={3} />];
    CACHE.set(id, els);
  }
  return els;
}

/** The artwork of one symbol, untouched, drawn inside the current 64 x 64 canvas, optionally moved or scaled. */
export function SymbolShapes({ id, matrix }: { id: string; matrix?: Matrix }) {
  return matrix ? <G transform={matrix}>{elementsFor(id)}</G> : <G>{elementsFor(id)}</G>;
}

/** A symbol on its own square canvas (library thumbnail, picker cell). */
export function SymbolArt({ id, size }: { id: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <SymbolShapes id={id} />
    </Svg>
  );
}
