/**
 * Animation Tokens
 *
 * Central source for all animation-related values.
 * Every animation in the app should reference these tokens.
 */
export const animations = {
  /** Duration tokens — map to behaviour, not seconds */
  duration: {
    instant: '75ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  /** Easing functions */
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  /** Transition shorthand presets */
  transition: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    spring: '300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const;

export type DurationToken = keyof typeof animations.duration;
export type EasingToken = keyof typeof animations.easing;
