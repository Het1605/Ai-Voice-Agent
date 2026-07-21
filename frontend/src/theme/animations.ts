export const animations = {
  durations: {
    instant: '75ms',
    fast:    '150ms',
    normal:  '200ms',
    slow:    '300ms',
    slower:  '500ms',
  },
  easings: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in:      'cubic-bezier(0.4, 0, 1, 1)',
    out:     'cubic-bezier(0, 0, 0.2, 1)',
    spring:  'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
};

export const shadows = {
  sm:  '0 1px 2px 0 oklch(0 0 0 / 0.05)',
  md:  '0 4px 6px -1px oklch(0 0 0 / 0.1), 0 2px 4px -2px oklch(0 0 0 / 0.1)',
  lg:  '0 10px 15px -3px oklch(0 0 0 / 0.1), 0 4px 6px -4px oklch(0 0 0 / 0.1)',
  xl:  '0 20px 25px -5px oklch(0 0 0 / 0.1), 0 8px 10px -6px oklch(0 0 0 / 0.1)',
  glow: '0 0 20px oklch(0.55 0.22 264 / 0.3)',
};
