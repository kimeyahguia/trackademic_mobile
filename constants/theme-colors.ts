import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#12241C',
    background: '#F4F7F5',
    tint: '#0F6E5C',
    icon: '#83938C',
    tabIconDefault: '#83938C',
    tabIconSelected: '#0F6E5C',
  },
  dark: {
    text: '#ECEDEE',
    background: '#0E2A22',
    tint: '#22C58B',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#22C58B',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, 'Helvetica Neue', 'Arial', sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// ---------------------------------------------------
// TRACKADEMIC PALETTE (sleek fintech-inspired)
// ---------------------------------------------------
export const COLORS = {
  bg: '#F4F7F5',
  card: '#FFFFFF',
  dark: '#0E2A22',        // deep forest green — hero/header backgrounds
  darkAlt: '#175943',
  primary: '#0F6E5C',
  primaryDark: '#0A4F42',
  accent: '#22C58B',       // bright mint green
  accentSoft: '#DFF6EB',
  text: '#12241C',
  subtext: '#83938C',
  border: '#E7EEEA',
  pink: '#E8437A',
  white: '#FFFFFF',
  danger: '#D64545',
  success: '#22C58B',
  warning: '#E2A83C',
};

// Gradient pairs for LinearGradient (hero header, promo banners, etc.)
export const GRADIENTS = {
  hero: ['#0E2A22', '#175943', '#22C58B'] as const,
  promo: ['#175943', '#22C58B'] as const,
};

// Used for attendance status badges
export const STATUS_COLORS: Record<string, string> = {
  'Present - On Time': '#22C58B',
  'Present - Late': '#E2A83C',
  'Absent': '#D64545',
  'Excused': '#83938C',
};

// Used for performance score bars/badges (percentage-based)
export const SCORE_COLORS = {
  excellent: '#22C58B', // >= 90%
  good: '#0F6E5C',      // >= 75%
  average: '#E2A83C',   // >= 50%
  poor: '#D64545',      // < 50%
};

export function getScoreColor(score: number, total: number): string {
  const pct = total > 0 ? (score / total) * 100 : 0;
  if (pct >= 90) return SCORE_COLORS.excellent;
  if (pct >= 75) return SCORE_COLORS.good;
  if (pct >= 50) return SCORE_COLORS.average;
  return SCORE_COLORS.poor;
}

export const FONT_SIZES = {
  xs: 14,
  sm: 15,
  base: 17,
  md: 17,
  lg: 20,
  xl: 22,
  xxl: 28,
};

export const TYPOGRAPHY = {
  heading: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800' as const,
    color: COLORS.text,
  },
  subheading: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700' as const,
    color: COLORS.text,
  },
  body: {
    fontSize: FONT_SIZES.base,
    fontWeight: '400' as const,
    color: COLORS.text,
  },
  caption: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '400' as const,
    color: COLORS.subtext,
  },
};