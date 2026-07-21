/**
 * Design Language — VoiceGateway
 *
 * This file aggregates every design token into a single overview.
 * It is the canonical reference for the product's visual language.
 *
 * Every future component should consume these tokens.
 * Hardcoded colors, sizes, or spacing values are not permitted.
 */

import { colors, brand, neutral, success, warning, error, info } from './colors';
import { typography, fontWeight } from './typography';
import { spacing } from './spacing';
import { radius } from './radius';
import { shadows } from './shadows';
import { animations } from './animations';
import { breakpoints } from './breakpoints';
import { zIndex } from './z-index';
import { layout } from './layout';

// ─── Design Language Overview ──────────────────────────────────────────────

export const designLanguage = {
  name: 'VoiceGateway Design System',
  version: '1.0.0',

  /** Primary identity */
  primaryColor: brand[500],
  secondaryColor: neutral[600],

  /** Semantic states */
  semantic: {
    success: success[500],
    warning: warning[500],
    error: error[500],
    info: info[500],
  },

  /** Surface hierarchy */
  surface: {
    background: colors.background,
    card: colors.card,
    popover: colors.popover,
    sidebar: colors.sidebar.DEFAULT,
  },

  /** Elevation levels */
  elevation: {
    surface: shadows.surface,
    card: shadows.card,
    dropdown: shadows.dropdown,
    popover: shadows.popover,
    modal: shadows.modal,
    floating: shadows.floating,
  },

  /** Border system */
  border: {
    default: colors.border,
    input: colors.input,
    radiusSm: radius.sm,
    radiusMd: radius.md,
    radiusLg: radius.lg,
  },

  /** Interaction states */
  interaction: {
    hover: colors.accent,
    focus: colors.ring,
    disabled: colors.muted,
    disabledForeground: colors.mutedForeground,
  },
} as const;

// ─── Aggregated Export ─────────────────────────────────────────────────────

export {
  colors,
  brand,
  neutral,
  success,
  warning,
  error,
  info,
  typography,
  fontWeight,
  spacing,
  radius,
  shadows,
  animations,
  breakpoints,
  zIndex,
  layout,
};
