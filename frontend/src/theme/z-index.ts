/**
 * Z-Index Layers
 *
 * Defines stacking order for the application.
 * Avoid using arbitrary z-index values — always reference these tokens.
 */
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  /** Dropdown menus, select options */
  dropdown: 100,
  /** Sticky headers, section sticks */
  sticky: 200,
  /** Banner notifications, announcement bars */
  banner: 300,
  /** Overlay / backdrop behind modals */
  overlay: 400,
  /** Modal dialogs, side panels */
  modal: 500,
  /** Popovers, tooltips */
  popover: 600,
  /** Toast notifications */
  toast: 700,
  /** Tooltips */
  tooltip: 800,
} as const;

export type ZIndexToken = keyof typeof zIndex;
