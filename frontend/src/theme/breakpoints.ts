/**
 * Responsive Breakpoints
 *
 * Mirrors Tailwind v4 default breakpoints.
 * Use in JavaScript logic; CSS should use Tailwind's breakpoint utilities.
 *
 * Usage:
 *   import { breakpoints } from '@/theme';
 *   if (window.innerWidth >= breakpoints.lg) { ... }
 */
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type BreakpointToken = keyof typeof breakpoints;
