/**
 * Border Radius Tokens
 *
 * Usage: `<div className="rounded-[var(--radius-md)]" />`
 * or programmatically: radius.md
 */
export const radius = {
  none: '0px',
  sm: 'calc(var(--radius) - 4px)', // 4px
  md: 'var(--radius)',             // 8px
  lg: 'calc(var(--radius) + 4px)', // 12px
  xl: '1rem',                      // 16px
  '2xl': '1.5rem',                 // 24px
  full: '9999px',
} as const;

export type RadiusToken = keyof typeof radius;
