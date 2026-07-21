'use client';

import { cn } from '@/lib/utils';
import type React from 'react';

// ─── Grid ─────────────────────────────────────────────────────────────────────

export type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 12;
export type GridGap = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;

export interface GridProps {
  children: React.ReactNode;
  className?: string;
  /** Number of columns (default 1) */
  cols?: GridCols;
  /** Gap between grid items (default 4 = 1rem) */
  gap?: GridGap;
  /** Responsive: columns at sm breakpoint */
  sm?: GridCols;
  /** Responsive: columns at md breakpoint */
  md?: GridCols;
  /** Responsive: columns at lg breakpoint */
  lg?: GridCols;
  /** Responsive: columns at xl breakpoint */
  xl?: GridCols;
}

/**
 * Grid
 *
 * Responsive CSS Grid layout with token-driven gap.
 * Supports breakpoint-aware column overrides.
 *
 * Example:
 *   <Grid cols={1} md={2} lg={3} gap={6}>
 *     <div>Item 1</div>
 *     <div>Item 2</div>
 *     <div>Item 3</div>
 *   </Grid>
 */
export function Grid({
  children,
  className,
  cols = 1,
  gap = 4,
  sm,
  md,
  lg,
  xl,
}: GridProps) {
  const gapClass = gapMap[gap] ?? 'gap-4';

  return (
    <div
      className={cn(
        'grid',
        gapClass,
        colsMap[cols],
        sm && smColsMap[sm],
        md && mdColsMap[md],
        lg && lgColsMap[lg],
        xl && xlColsMap[xl],
        className,
      )}
    >
      {children}
    </div>
  );
}

// ─── GridItem ─────────────────────────────────────────────────────────────────

export interface GridItemProps {
  children: React.ReactNode;
  className?: string;
  /** Span this item across N columns */
  colSpan?: GridCols;
  /** Span this item across N rows */
  rowSpan?: 1 | 2 | 3;
}

/**
 * GridItem
 *
 * Explicitly-controlled grid child for spanning multiple
 * columns or rows within a Grid.
 */
export function GridItem({
  children,
  className,
  colSpan,
  rowSpan,
}: GridItemProps) {
  return (
    <div
      className={cn(
        colSpan && colSpanMap[colSpan],
        rowSpan && rowSpanMap[rowSpan],
        className,
      )}
    >
      {children}
    </div>
  );
}

// ─── Internal Maps ────────────────────────────────────────────────────────────

const colsMap: Record<GridCols, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  12: 'grid-cols-12',
};

const smColsMap: Record<GridCols, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
  5: 'sm:grid-cols-5',
  6: 'sm:grid-cols-6',
  12: 'sm:grid-cols-12',
};

const mdColsMap: Record<GridCols, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
  12: 'md:grid-cols-12',
};

const lgColsMap: Record<GridCols, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
  12: 'lg:grid-cols-12',
};

const xlColsMap: Record<GridCols, string> = {
  1: 'xl:grid-cols-1',
  2: 'xl:grid-cols-2',
  3: 'xl:grid-cols-3',
  4: 'xl:grid-cols-4',
  5: 'xl:grid-cols-5',
  6: 'xl:grid-cols-6',
  12: 'xl:grid-cols-12',
};

const gapMap: Record<GridGap, string> = {
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

const colSpanMap: Record<GridCols, string> = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6',
  12: 'col-span-12',
};

const rowSpanMap: Record<1 | 2 | 3, string> = {
  1: 'row-span-1',
  2: 'row-span-2',
  3: 'row-span-3',
};
