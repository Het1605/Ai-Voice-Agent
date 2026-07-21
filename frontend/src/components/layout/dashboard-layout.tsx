'use client';

import { AppShell } from './app-shell';
import { Sidebar } from './sidebar';
import { Header } from './header';
import type { AppShellProps } from './app-shell';

export interface DashboardLayoutProps
  extends Omit<AppShellProps, 'sidebar' | 'header'> {
  /** Override the default sidebar */
  sidebar?: React.ReactNode;
  /** Override the default header */
  header?: React.ReactNode;
}

/**
 * DashboardLayout
 *
 * Pre-configured AppShell for dashboard pages.
 * Wires up the standard Sidebar + Header by default.
 * Overridable for page-specific variants.
 *
 * ⚠️ Layout only — no dashboard-widget assumptions.
 */
export function DashboardLayout({
  children,
  sidebar = <Sidebar />,
  header = <Header />,
  ...rest
}: DashboardLayoutProps) {
  return (
    <AppShell sidebar={sidebar} header={header} {...rest}>
      {children}
    </AppShell>
  );
}
