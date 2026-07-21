/**
 * Color System
 *
 * The complete design language for VoiceGateway.
 *
 * Organization:
 *   brand  → Primary identity color (indigo/blue)
 *   neutral → Gray scale for text, borders, backgrounds
 *   success/warning/error/info → Semantic states
 *   surface → Background hierarchy tokens (reference CSS vars for theme support)
 *
 * Usage guidelines:
 *   - Use semantic tokens (foreground, muted, etc.) for most UI.
 *   - Use palette tokens (brand[500], neutral[200]) for custom graphics.
 *   - Never use raw hex/rgb/oklch values outside this file.
 */

// ─── Brand Palette (Indigo) ─────────────────────────────────────────────────
export const brand = {
  50: 'oklch(0.97 0.01 264)',
  100: 'oklch(0.93 0.04 264)',
  200: 'oklch(0.86 0.09 264)',
  300: 'oklch(0.74 0.17 264)',
  400: 'oklch(0.62 0.22 264)',
  500: 'oklch(0.55 0.22 264)',
  600: 'oklch(0.47 0.20 264)',
  700: 'oklch(0.38 0.17 264)',
  800: 'oklch(0.28 0.13 264)',
  900: 'oklch(0.18 0.08 264)',
  950: 'oklch(0.12 0.04 264)',
} as const;

// ─── Neutral Palette (Cool Gray) ────────────────────────────────────────────
export const neutral = {
  50: 'oklch(0.985 0.002 264)',
  100: 'oklch(0.97 0.003 264)',
  200: 'oklch(0.92 0.005 264)',
  300: 'oklch(0.87 0.006 264)',
  400: 'oklch(0.73 0.008 264)',
  500: 'oklch(0.55 0.010 264)',
  600: 'oklch(0.45 0.011 264)',
  700: 'oklch(0.35 0.012 264)',
  800: 'oklch(0.25 0.013 264)',
  900: 'oklch(0.15 0.014 264)',
  950: 'oklch(0.08 0.015 264)',
} as const;

// ─── Semantic Palette ───────────────────────────────────────────────────────
export const success = {
  50: 'oklch(0.95 0.05 145)',
  100: 'oklch(0.90 0.10 145)',
  200: 'oklch(0.82 0.15 145)',
  300: 'oklch(0.72 0.18 145)',
  400: 'oklch(0.65 0.18 145)',
  500: 'oklch(0.60 0.18 145)',
  600: 'oklch(0.52 0.17 145)',
  700: 'oklch(0.42 0.15 145)',
  800: 'oklch(0.32 0.12 145)',
  900: 'oklch(0.22 0.08 145)',
} as const;

export const warning = {
  50: 'oklch(0.95 0.06 75)',
  100: 'oklch(0.90 0.12 75)',
  200: 'oklch(0.85 0.18 75)',
  300: 'oklch(0.78 0.18 75)',
  400: 'oklch(0.72 0.18 75)',
  500: 'oklch(0.68 0.16 75)',
  600: 'oklch(0.58 0.14 75)',
  700: 'oklch(0.46 0.12 75)',
  800: 'oklch(0.35 0.09 75)',
  900: 'oklch(0.24 0.06 75)',
} as const;

export const error = {
  50: 'oklch(0.95 0.04 28)',
  100: 'oklch(0.90 0.08 28)',
  200: 'oklch(0.80 0.14 28)',
  300: 'oklch(0.70 0.20 28)',
  400: 'oklch(0.62 0.24 28)',
  500: 'oklch(0.58 0.24 27)',
  600: 'oklch(0.50 0.22 27)',
  700: 'oklch(0.40 0.18 27)',
  800: 'oklch(0.30 0.14 27)',
  900: 'oklch(0.20 0.08 27)',
} as const;

export const info = {
  50: 'oklch(0.95 0.02 240)',
  100: 'oklch(0.90 0.04 240)',
  200: 'oklch(0.80 0.08 240)',
  300: 'oklch(0.70 0.12 240)',
  400: 'oklch(0.60 0.15 240)',
  500: 'oklch(0.55 0.15 240)',
  600: 'oklch(0.45 0.13 240)',
  700: 'oklch(0.35 0.11 240)',
  800: 'oklch(0.25 0.08 240)',
  900: 'oklch(0.15 0.05 240)',
} as const;

// ─── Semantic Surface Tokens ────────────────────────────────────────────────
// These reference CSS custom properties so they change with theme (light/dark).
// Components should use these for most UI work.

export const colors = {
  // Surface hierarchy
  background: 'var(--background)',
  foreground: 'var(--foreground)',
  card: 'var(--card)',
  cardForeground: 'var(--card-foreground)',
  popover: 'var(--popover)',
  popoverForeground: 'var(--popover-foreground)',

  // Interactive colors
  primary: 'var(--primary)',
  primaryForeground: 'var(--primary-foreground)',
  secondary: 'var(--secondary)',
  secondaryForeground: 'var(--secondary-foreground)',

  // Muted / subdued
  muted: 'var(--muted)',
  mutedForeground: 'var(--muted-foreground)',

  // Accent (interactive hover, selected states)
  accent: 'var(--accent)',
  accentForeground: 'var(--accent-foreground)',

  // Destructive actions
  destructive: 'var(--destructive)',
  destructiveForeground: 'var(--destructive-foreground)',

  // Borders & inputs
  border: 'var(--border)',
  input: 'var(--input)',
  ring: 'var(--ring)',

  // Sidebar
  sidebar: {
    DEFAULT: 'var(--sidebar-background)',
    foreground: 'var(--sidebar-foreground)',
    primary: 'var(--sidebar-primary)',
    primaryForeground: 'var(--sidebar-primary-foreground)',
    accent: 'var(--sidebar-accent)',
    accentForeground: 'var(--sidebar-accent-foreground)',
    border: 'var(--sidebar-border)',
    ring: 'var(--sidebar-ring)',
  },

  // Semantic states
  success: 'var(--success)',
  successForeground: 'var(--success-foreground)',
  warning: 'var(--warning)',
  warningForeground: 'var(--warning-foreground)',
  error: 'var(--error)',
  errorForeground: 'var(--error-foreground)',
  info: 'var(--info)',
  infoForeground: 'var(--info-foreground)',
} as const;
