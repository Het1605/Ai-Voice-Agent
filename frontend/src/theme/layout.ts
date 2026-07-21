/**
 * Layout Dimensions
 *
 * Fixed layout measurements used throughout the application.
 * Every component referencing these dimensions should use these tokens.
 */
export const layout = {
  /** Sidebar */
  sidebarWidth: '16rem',        // 256px
  sidebarCollapsedWidth: '4rem', // 64px

  /** Header */
  headerHeight: '3.75rem',      // 60px

  /** Content */
  maxContentWidth: '80rem',     // 1280px
  contentPaddingX: '1.5rem',    // 24px
  contentPaddingY: '1.5rem',    // 24px

  /** Agent workspace tabs */
  agentTabHeight: '3rem',       // 48px

  /** Input fields */
  inputHeight: '2.5rem',        // 40px
  inputHeightLg: '3rem',        // 48px
  inputHeightSm: '2rem',        // 32px

  /** Icon sizes */
  iconXs: '0.75rem',    // 12px
  iconSm: '1rem',       // 16px
  iconMd: '1.25rem',    // 20px
  iconLg: '1.5rem',     // 24px
  iconXl: '2rem',       // 32px
} as const;

export type LayoutToken = keyof typeof layout;
