export const colors = {
  red: {
    950: '#3B0710',
    900: '#640D1B',
    800: '#8F1428',
    700: '#B51D35',
    600: '#D62845',
    500: '#E63950',
    400: '#ED6678',
    300: '#F28D9B',
    200: '#F7B7C0',
    100: '#FBDDE1',
    50: '#FEF1F3',
  },
  black: {
    950: '#050505',
    900: '#0B0B0C',
    800: '#151517',
    700: '#242427',
    600: '#3A3A3F',
    500: '#58585F',
    400: '#77777F',
    300: '#9D9DA4',
    200: '#C6C6CB',
    100: '#E5E5E8',
    50: '#F4F4F5',
  },
  white: '#FFFFFF',
  softWhite: '#FAFAFB',
  overlay: 'rgba(5, 5, 5, 0.48)',
  success: '#198754',
  warning: '#B7791F',
  error: '#B42318',
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 44,
} as const;

export const radii = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

export const shadows = {
  card: {
    shadowColor: colors.black[950],
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
} as const;

