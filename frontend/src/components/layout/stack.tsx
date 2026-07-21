'use client';

import { cn } from '@/lib/utils';
import type React from 'react';

// ─── Stack ────────────────────────────────────────────────────────────────────

export type StackDirection = 'row' | 'column';
export type StackGap = 0 | 0.5 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
export type StackAlign = 'start' | 'center' | 'end' | 'stretch';
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around';

export interface StackProps {
  children: React.ReactNode;
  /** Layout direction (default column) */
  direction?: StackDirection;
  /** Gap between items (default 4 = 1rem) */
  gap?: StackGap;
  /** Align items on the cross-axis */
  align?: StackAlign;
  /** Justify items on the main-axis */
  justify?: StackJustify;
  className?: string;
  /** Semantic element type (default div) */
  as?: 'div' | 'section' | 'nav' | 'ol' | 'ul';
  /** Allow items to wrap (row only) */
  wrap?: boolean;
}

/**
 * Stack
 *
 * Flexible layout primitive for placing items with consistent spacing.
 * Think "flexbox with sensible defaults."
 *
 * VStack (default) — vertical column
 * HStack — horizontal row (direction="row")
 *
 * Examples:
 *   <Stack gap={4}>
 *     <div>Item 1</div>
 *     <div>Item 2</div>
 *   </Stack>
 *
 *   <Stack direction="row" gap={3} align="center">
 *     <Avatar />
 *     <span>Name</span>
 *   </Stack>
 */
export function Stack({
  children,
  direction = 'column',
  gap = 4,
  align,
  justify,
  className,
  as: Tag = 'div',
  wrap = false,
}: StackProps) {
  return (
    <Tag
      className={cn(
        'flex',
        direction === 'column' ? 'flex-col' : 'flex-row',
        gapMap[gap],
        align && alignMap[align],
        justify && justifyMap[justify],
        wrap && 'flex-wrap',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

// ─── Convenience Exports ──────────────────────────────────────────────────────

/**
 * VStack — vertical Stack (default direction)
 */
export function VStack(props: Omit<StackProps, 'direction'>) {
  return <Stack direction="column" {...props} />;
}

/**
 * HStack — horizontal Stack
 */
export function HStack(props: Omit<StackProps, 'direction'>) {
  return <Stack direction="row" {...props} />;
}

// ─── Internal Maps ────────────────────────────────────────────────────────────

const gapMap: Record<StackGap, string> = {
  0: 'gap-0',
  0.5: 'gap-0.5',
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

const alignMap: Record<StackAlign, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const justifyMap: Record<StackJustify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
};
