'use client';

import { cn } from '@/lib/utils';
import type React from 'react';

// ─── SplitLayout ──────────────────────────────────────────────────────────────

export type SplitRatio = '50:50' | '60:40' | '40:60' | '70:30' | '30:70';
export type StackBreakpoint = 'sm' | 'md' | 'lg';

export interface SplitLayoutProps {
  /** Exactly two children — the two panels */
  children: [React.ReactNode, React.ReactNode];
  className?: string;
  /** Width ratio between the two panels (default 50:50) */
  ratio?: SplitRatio;
  /** Breakpoint at which panels stack vertically (default md) */
  stackAt?: StackBreakpoint;
  /** Gap between panels (default 6) */
  gutter?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
}

/**
 * SplitLayout
 *
 * Two-panel split layout that goes side-by-side on wide screens
 * and stacks vertically on narrow screens.
 *
 * Ideal for:
 *   - Settings: sidebar nav + form panel
 *   - Detail views: list + detail panel
 *   - Agent workspace: config panel + preview
 *
 * Example:
 *   <SplitLayout ratio="60:40" stackAt="md" gutter={6}>
 *     <SettingsForm />
 *     <PreviewPanel />
 *   </SplitLayout>
 */
export function SplitLayout({
  children,
  className,
  ratio = '50:50',
  stackAt = 'md',
  gutter = 6,
}: SplitLayoutProps) {
  const [left, right] = children;

  return (
    <div
      className={cn(
        'flex flex-col',
        stackAtMap[stackAt],
        gapMap[gutter],
        className,
      )}
    >
      <div className={cn('min-w-0 flex-1', ratioMap[ratio].left)}>
        {left}
      </div>
      <div className={cn('min-w-0 flex-1', ratioMap[ratio].right)}>
        {right}
      </div>
    </div>
  );
}

// ─── Internal Maps ────────────────────────────────────────────────────────────

const gapMap: Record<number, string> = {
  0: 'gap-0',
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
  8: 'gap-8',
  10: 'gap-10',
  12: 'gap-12',
};

const stackAtMap: Record<StackBreakpoint, string> = {
  sm: 'sm:flex-row',
  md: 'md:flex-row',
  lg: 'lg:flex-row',
};

const ratioMap: Record<SplitRatio, { left: string; right: string }> = {
  '50:50': { left: 'md:w-1/2', right: 'md:w-1/2' },
  '60:40': { left: 'md:w-3/5', right: 'md:w-2/5' },
  '40:60': { left: 'md:w-2/5', right: 'md:w-3/5' },
  '70:30': { left: 'md:w-7/12', right: 'md:w-5/12' },
  '30:70': { left: 'md:w-5/12', right: 'md:w-7/12' },
};
