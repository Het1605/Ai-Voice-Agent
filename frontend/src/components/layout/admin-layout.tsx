'use client';

import { AppShell } from './app-shell';
import { ShellHeader } from '@/components/shell';
import type { AppShellProps } from './app-shell';

/**
 * AdminLayout
 *
 * AppShell variant for admin / system-management pages.
 * Intentionally omits the main sidebar — admin pages use a lighter chrome
 * (header-only or header + minimal sub-nav).
 *
 * Future: add an admin-specific slim sidebar or top-nav bar as needed.
 */
export function AdminLayout({
  children,
  header = <ShellHeader />,
  ...rest
}: Omit<AppShellProps, 'sidebar'> & {
  /** Override the default header */
  header?: React.ReactNode;
}) {
  return (
    <AppShell sidebar={undefined} header={header} {...rest}>
      {children}
    </AppShell>
  );
}
