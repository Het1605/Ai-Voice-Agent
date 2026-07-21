'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type React from 'react';

// ─── Variants ─────────────────────────────────────────────────────────────────

const headingVariants = cva(
  'font-semibold tracking-tight text-foreground',
  {
    variants: {
      /**
       * Semantic level — maps to h1–h6 tags and theme typography tokens.
       * Default h1 uses --text-h1, h2 → --text-h2, etc.
       */
      level: {
        1: 'text-h1',
        2: 'text-h2',
        3: 'text-h3',
        4: 'text-h4',
        5: 'text-body-lg font-semibold',
        6: 'text-body font-semibold',
      },
      /**
       * Optional visual size override — render at one level's size
       * while keeping a different semantic tag.
       */
      size: {
        h1: 'text-h1',
        h2: 'text-h2',
        h3: 'text-h3',
        h4: 'text-h4',
        h5: 'text-body-lg',
        h6: 'text-body',
      },
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
      },
    },
    defaultVariants: {
      level: 1,
    },
  }
);

// ─── Types ────────────────────────────────────────────────────────────────────

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export interface HeadingProps
  extends React.ComponentProps<'h1'>,
    Omit<VariantProps<typeof headingVariants>, 'size'> {
  /** Semantic heading level (1–6). Also used as the rendered tag. */
  level?: HeadingLevel;
  /** Visual size override — renders at a different size than the tag implies. */
  size?: HeadingLevel;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Heading
 *
 * Renders a semantic heading (h1–h6) using theme typography tokens.
 * Supports visual size override: use `level={2} size={1}` for an h2
 * that looks like an h1.
 *
 * @example
 * <Heading level={1}>Page Title</Heading>
 * <Heading level={2} size={3}>Section (h2 text styled as h3)</Heading>
 * <Heading level={3} align="center">Centered section</Heading>
 */
function Heading({
  className,
  level = 1,
  size: sizeProp,
  align,
  ...props
}: HeadingProps) {
  const Tag = `h${level}` as React.ElementType;
  const sizeKey = sizeProp ? (`h${sizeProp}` as const) : undefined;

  return (
    <Tag
      className={cn(headingVariants({ level: level as 1 | 2 | 3 | 4 | 5 | 6, size: sizeKey, align }), className)}
      {...props}
    />
  );
}

export { Heading, headingVariants };
