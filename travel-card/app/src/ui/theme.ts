// Tokens of the App Style Sheet v0.3 (sections 2 to 4). Screens use these names, never raw values.
export const colors = {
  background: '#F4F6F8',
  surface: '#FFFFFF',
  surfaceVariant: '#E9EEF2',
  onSurface: '#212121',
  onSurfaceMuted: '#4A5A66',
  outline: '#78909C',
  outlineSubtle: '#D5DDE3',
  primary: '#1565C0',
  onPrimary: '#FFFFFF',
  primaryContainer: '#DCEBFA',
  onPrimaryContainer: '#0B3D7A',
  danger: '#C62828',
  dangerContainer: '#FDECEA',
  warning: '#F57C00',
  warningContainer: '#FFF1DC',
  onWarningContainer: '#6B3600',
  success: '#2E7D32',
  disabledText: '#6B7B86',
  displayBackground: '#FFFFFF',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { small: 8, cell: 12, tile: 16, pill: 28 } as const;

// Android system font, two weights only (style sheet 3). Sizes in sp.
export const type = {
  titleLarge: { fontSize: 22, lineHeight: 28, fontWeight: '500' as const },
  titleMedium: { fontSize: 16, lineHeight: 24, fontWeight: '500' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
};

export const MIN_TARGET = 48;
