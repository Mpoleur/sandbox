/** Display mode layout (App Style Sheet 6, Technical Analysis 10.1). All sizes in dp. */
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DisplayLayout {
  kind: 'symbol' | 'photo' | 'both';
  /** The square holding the main symbol and its badges. */
  card?: Box;
  photo?: Box;
  label?: Box;
}

export const DISPLAY_MARGIN = 8; // symbol only
export const DISPLAY_PAD = 16; // symbol and photo
export const DISPLAY_GAP = 12;
export const LABEL_HEIGHT = 36; // title-large (28) plus 8

export interface DisplayInput {
  width: number;
  height: number;
  hasSymbol: boolean;
  hasPhoto: boolean;
  showLabel: boolean;
}

export function computeDisplayLayout({ width, height, hasSymbol, hasPhoto, showLabel }: DisplayInput): DisplayLayout {
  const labelH = showLabel ? LABEL_HEIGHT : 0;
  if (hasPhoto && !hasSymbol) return { kind: 'photo', photo: { x: 0, y: 0, w: width, h: height } };
  if (!hasPhoto) {
    // Portrait: screen width minus margins; landscape: screen height minus margins; centred.
    const side = Math.max(0, Math.min(width - 2 * DISPLAY_MARGIN, height - 2 * DISPLAY_MARGIN - labelH));
    const top = (height - side - labelH) / 2;
    return {
      kind: 'symbol',
      card: { x: (width - side) / 2, y: top, w: side, h: side },
      label: showLabel ? { x: DISPLAY_MARGIN, y: top + side, w: width - 2 * DISPLAY_MARGIN, h: labelH } : undefined,
    };
  }
  if (height >= width) {
    const side = Math.max(0, width - 2 * DISPLAY_PAD);
    const photoTop = DISPLAY_PAD + side + labelH + DISPLAY_GAP;
    return {
      kind: 'both',
      card: { x: DISPLAY_PAD, y: DISPLAY_PAD, w: side, h: side },
      label: showLabel ? { x: DISPLAY_PAD, y: DISPLAY_PAD + side, w: side, h: labelH } : undefined,
      photo: { x: DISPLAY_PAD, y: photoTop, w: side, h: Math.max(0, height - photoTop - DISPLAY_PAD) },
    };
  }
  // Landscape: the symbol card on the left, the photo on the right.
  const side = Math.max(0, Math.min(height - 2 * DISPLAY_PAD - labelH, Math.floor(width / 2) - DISPLAY_PAD - DISPLAY_GAP / 2));
  const top = (height - side - labelH) / 2;
  const photoX = DISPLAY_PAD + side + DISPLAY_GAP;
  return {
    kind: 'both',
    card: { x: DISPLAY_PAD, y: top, w: side, h: side },
    label: showLabel ? { x: DISPLAY_PAD, y: top + side, w: side, h: labelH } : undefined,
    photo: { x: photoX, y: DISPLAY_PAD, w: Math.max(0, width - photoX - DISPLAY_PAD), h: height - 2 * DISPLAY_PAD },
  };
}
