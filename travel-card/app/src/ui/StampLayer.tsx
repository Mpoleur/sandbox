import React from 'react';
import Svg, { Circle, Ellipse, G, Path, Polygon, Rect } from 'react-native-svg';
import { STAMPS, STAMPS_SIZE, STAMPS_VIEWBOX } from '../generated/stamps.generated';
import type { Shape } from '../generated/symbols.generated';

const TAGS: Record<string, React.ElementType> = { g: G, path: Path, circle: Circle, ellipse: Ellipse, rect: Rect, polygon: Polygon };

function render(s: Shape, key: string): React.ReactElement {
  const [tag, props, kids] = s;
  const Tag = TAGS[tag];
  return (
    <Tag key={key} {...props}>
      {kids.map((k, i) => render(k, `${key}.${i}`))}
    </Tag>
  );
}

const ELEMENTS = STAMPS.map((s, i) => render(s, `s${i}`));

/**
 * Background 4e: passport stamps (planes, boats, buses) in soft inks, one fixed layer at the bottom right. It does not
 * scroll; the list scrolls over it. It takes no touches and is hidden from screen readers.
 */
export function StampLayer() {
  return (
    <Svg
      width={STAMPS_SIZE.width}
      height={STAMPS_SIZE.height}
      viewBox={STAMPS_VIEWBOX}
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={{ position: 'absolute', right: 0, bottom: 0 }}
    >
      {ELEMENTS}
    </Svg>
  );
}
