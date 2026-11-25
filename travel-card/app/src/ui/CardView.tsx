import React from 'react';
import Svg from 'react-native-svg';
import { NO_ID } from '../core/catalog';
import { layoutItem, type CardItemData } from '../core/compose';
import { SymbolShapes } from './SymbolArt';

/**
 * Draws one card item (main symbol, "No" sign, badges) as a single vector picture of any size.
 * Layers, bottom to top: main symbol, No sign, badge in slot A, badge in slot B (Technical Analysis 9).
 */
export function CardView({ item, size }: { item: CardItemData; size: number }) {
  const layout = layoutItem(item);
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <SymbolShapes id={layout.symbolId} matrix={layout.symbolMatrix} />
      {layout.noSign ? <SymbolShapes id={NO_ID} /> : null}
      {layout.badges.map((b) => (
        <SymbolShapes key={b.id} id={b.id} matrix={b.matrix} />
      ))}
    </Svg>
  );
}
