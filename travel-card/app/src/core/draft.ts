/**
 * The editor's work in progress, written just before the camera or gallery opens. If Android closes the app meanwhile,
 * the draft and the picked photo are restored at the next start (Technical Analysis 8.4).
 */
export interface EditorDraft {
  /** 'new', or the id of the card being edited. */
  cardId: string;
  symbolId: string | null;
  badges: string[];
  label: string;
  showLabel: boolean;
  categoryId: string;
  /** True once the user chose a category by hand, so choosing a symbol no longer changes it. */
  categoryTouched: boolean;
  /** The photo currently attached (already in the permanent folder), if any. */
  photoFile: string | null;
  thumbFile: string | null;
}

export const DRAFT_SETTING_KEY = 'editorDraft';

export function serializeDraft(d: EditorDraft): string {
  return JSON.stringify(d);
}

function isStringOrNull(v: unknown): v is string | null {
  return v === null || typeof v === 'string';
}

/** Reads a stored draft; anything odd gives null rather than a crash. */
export function parseDraft(json: string | null | undefined): EditorDraft | null {
  if (!json) return null;
  try {
    const d = JSON.parse(json) as Partial<EditorDraft>;
    if (
      typeof d.cardId !== 'string' || !isStringOrNull(d.symbolId ?? null) || !Array.isArray(d.badges) ||
      !d.badges.every((b) => typeof b === 'string') || typeof d.label !== 'string' || typeof d.showLabel !== 'boolean' ||
      typeof d.categoryId !== 'string' || !isStringOrNull(d.photoFile ?? null) || !isStringOrNull(d.thumbFile ?? null)
    ) return null;
    return {
      cardId: d.cardId, symbolId: d.symbolId ?? null, badges: d.badges, label: d.label, showLabel: d.showLabel,
      categoryId: d.categoryId, categoryTouched: d.categoryTouched === true, photoFile: d.photoFile ?? null, thumbFile: d.thumbFile ?? null,
    };
  } catch {
    return null;
  }
}
