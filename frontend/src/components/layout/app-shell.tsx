'use client';

import { useUIStore } from '@/store/ui-store';
import { cn } from '@/lib/utils';
import { layout } from '@/theme';
import type React from 'react';

export interface AppShellProps {
  /** Main content area */
  children: React.ReactNode;
  /** Sidebar component (defaults to the built-in Sidebar if omitted) */
  sidebar?: React.ReactNode;
  /** Header component (defaults to the built-in Header if omitted) */
  header?: React.ReactNode;
  /** Hide the sidebar entirely */
  hideSidebar?: boolean;
  /** Hide the header entirely */
  hideHeader?: boolean;
  /** Additional class on the root element */
  className?: string;

  // ─── Future expansion slots ────────────────────────────────────────────
  /** Future: slide-in notification center panel */
  notificationCenter?: React.ReactNode;
  /** Future: command palette overlay */
  commandPalette?: React.ReactNode;
}

/**
 * AppShell
 *
 * The root layout wrapper for every authenticated page.
 * Composes Sidebar + Header + main content in a full-viewport flex container.
 *
 * Handles sidebar collapse state, responsive behavior, and provides
 * expansion slots for future global UI (notification center, command palette).
 */
export function AppShell({
  children,
  sidebar,
  header,
  hideSidebar = false,
  hideHeader = false,
  className,
  notificationCenter,
  commandPalette,
}: AppShellProps) {
  const isSidebarOpen = useUIStore((s) => s.isSidebarOpen);

  return (
    <div
      className={cn('flex h-screen w-full overflow-hidden bg-background', className)}
      style={{ '--sidebar-width': isSidebarOpen ? layout.sidebarWidth : layout.sidebarCollapsedWidth } as React.CSSProperties}
    >
      {/* Sidebar region */}
      {!hideSidebar && sidebar}

      {/* Right panel: header + content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {!hideHeader && header}

        {/* Scrollable main content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Future expansion overlays / panels */}
      {notificationCenter}
      {commandPalette}
    </div>
  );
}
