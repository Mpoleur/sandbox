/**
 * Category border colours of Home design D4 (docs/design/mockups/home-concepts-2.html). Used only as the 3 dp ticket
 * border, never as fill or text. The five categories on the mock-up page use the page's values. The others are my own
 * choices (the page does not list them), each at least 3:1 against the white ticket (non-text contrast).
 */
export const DESIGN_COLORS: Record<string, string> = {
  'diet-allergies': '#E65100',
  'places-directions': '#1565C0',
  pets: '#6D4C41',
  'health-emergency': '#2E7D32',
  transport: '#00796B',
};

export const CHOSEN_COLORS: Record<string, string> = {
  basics: '#37474F',
  'food-beverage': '#AD1457',
  accommodation: '#4527A0',
  'money-shopping': '#827717',
  'time-numbers': '#607D8B',
  'communication-tech': '#6A1B9A',
  activities: '#558B2F',
  'religion-customs': '#8D6E63',
};

/** Custom categories (made by the user) share one neutral slate. */
export const CUSTOM_COLOR = '#546E7A';

export function categoryColor(id: string, kind: 'default' | 'custom'): string {
  if (kind === 'custom') return CUSTOM_COLOR;
  return DESIGN_COLORS[id] ?? CHOSEN_COLORS[id] ?? CUSTOM_COLOR;
}

/** WCAG contrast ratio of two #RRGGBB colours. */
export function contrast(a: string, b: string): number {
  const lum = (hex: string): number => {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
