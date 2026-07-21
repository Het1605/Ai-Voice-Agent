/**
 * Shadow & Elevation System
 *
 * Defines elevation levels for consistent visual hierarchy.
 * Each level has a specific purpose and should not be used arbitrarily.
 */
export const shadows = {
  /** Default surface — no elevation */
  surface: 'none',
  /** Subtle card elevation */
  card: '0 1px 3px 0 oklch(0 0 0 / 0.08), 0 1px 2px -1px oklch(0 0 0 / 0.06)',
  /** Dropdown menus, select options */
  dropdown: '0 4px 6px -1px oklch(0 0 0 / 0.10), 0 2px 4px -2px oklch(0 0 0 / 0.08)',
  /** Popovers, tooltips, datepickers */
  popover: '0 10px 15px -3px oklch(0 0 0 / 0.10), 0 4px 6px -4px oklch(0 0 0 / 0.08)',
  /** Modal dialogs, side panels */
  modal: '0 20px 25px -5px oklch(0 0 0 / 0.12), 0 8px 10px -6px oklch(0 0 0 / 0.08)',
  /** Floating elements (FAB, notifications) */
  floating: '0 25px 50px -12px oklch(0 0 0 / 0.18)',
  /** Focus ring */
  ring: '0 0 0 2px var(--background), 0 0 0 4px var(--ring)',
  /** Glow effect for active nav */
  glow: '0 0 16px oklch(0.55 0.22 264 / 0.30)',
} as const;

export type ShadowToken = keyof typeof shadows;
