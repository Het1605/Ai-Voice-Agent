/**
 * Theme — Single Source of Truth
 *
 * Import tokens from here.
 * Never import directly from individual token files.
 *
 * Usage:
 *   import { spacing, colors, typography } from '@/theme';
 *   <div style={{ padding: spacing[4], color: colors.foreground }} />
 */

export {
  colors,
  brand,
  neutral,
  success,
  warning,
  error,
  info,
} from './colors';

export {
  typography,
  fontWeight,
  type TypographyPreset,
  type FontWeightToken,
} from './typography';

export { spacing, type SpacingToken } from './spacing';
export { radius, type RadiusToken } from './radius';
export { shadows, type ShadowToken } from './shadows';
export {
  animations,
  type DurationToken,
  type EasingToken,
} from './animations';
export { breakpoints, type BreakpointToken } from './breakpoints';
export { zIndex, type ZIndexToken } from './z-index';
export { layout, type LayoutToken } from './layout';
export { designLanguage } from './tokens';
