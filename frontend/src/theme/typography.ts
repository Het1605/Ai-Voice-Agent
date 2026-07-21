/**
 * Typography System
 *
 * A complete type scale with predefined text styles.
 * Every text element in the application should use one of these presets.
 *
 * Usage:
 *   <p className={typography.body}>Regular paragraph</p>
 *   <h1 className={typography.h1}>Heading</h1>
 *
 * For CSS/Tailwind, use the corresponding utility classes:
 *   text-display, text-h1, text-body, etc. (defined in globals.css)
 */

export const typography = {
  /** Font family definitions */
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
  },

  /** Type scale presets — map to Tailwind utility classes via @theme */
  display: {
    fontSize: '3rem',       // 48px
    lineHeight: '1.1',
    fontWeight: '700',
    letterSpacing: '-0.025em',
  },
  h1: {
    fontSize: '2.25rem',    // 36px
    lineHeight: '1.2',
    fontWeight: '700',
    letterSpacing: '-0.02em',
  },
  h2: {
    fontSize: '1.875rem',   // 30px
    lineHeight: '1.3',
    fontWeight: '600',
    letterSpacing: '-0.015em',
  },
  h3: {
    fontSize: '1.5rem',     // 24px
    lineHeight: '1.4',
    fontWeight: '600',
    letterSpacing: '-0.01em',
  },
  h4: {
    fontSize: '1.25rem',    // 20px
    lineHeight: '1.4',
    fontWeight: '600',
    letterSpacing: '0em',
  },
  'body-lg': {
    fontSize: '1.125rem',   // 18px
    lineHeight: '1.6',
    fontWeight: '400',
    letterSpacing: '0em',
  },
  body: {
    fontSize: '1rem',       // 16px
    lineHeight: '1.6',
    fontWeight: '400',
    letterSpacing: '0em',
  },
  'body-sm': {
    fontSize: '0.875rem',   // 14px
    lineHeight: '1.5',
    fontWeight: '400',
    letterSpacing: '0em',
  },
  small: {
    fontSize: '0.75rem',    // 12px
    lineHeight: '1.5',
    fontWeight: '400',
    letterSpacing: '0em',
  },
  caption: {
    fontSize: '0.75rem',    // 12px
    lineHeight: '1.4',
    fontWeight: '400',
    letterSpacing: '0.02em',
  },
  label: {
    fontSize: '0.875rem',   // 14px
    lineHeight: '1.5',
    fontWeight: '500',
    letterSpacing: '0em',
  },
  /** Small uppercase label */
  'label-uppercase': {
    fontSize: '0.6875rem',  // 11px
    lineHeight: '1.2',
    fontWeight: '600',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  /** Code / monospace */
  code: {
    fontSize: '0.875rem',   // 14px
    lineHeight: '1.5',
    fontWeight: '400',
    fontFamily: 'JetBrains Mono, monospace',
  },
} as const;

/** Font weight scale */
export const fontWeight = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

export type TypographyPreset = keyof typeof typography;
export type FontWeightToken = keyof typeof fontWeight;
