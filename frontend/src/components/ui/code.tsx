'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type React from 'react';

// ─── Variants ─────────────────────────────────────────────────────────────────

const codeVariants = cva(
  'font-mono text-code',
  {
    variants: {
      variant: {
        /** Inline code within body text (code tag) */
        inline:
          'rounded-md bg-muted px-1.5 py-0.5 text-foreground',
        /** Multi-line code block (pre > code) */
        block:
          'block w-full overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 leading-relaxed text-foreground',
      },
    },
    defaultVariants: {
      variant: 'inline',
    },
  }
);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CodeProps
  extends React.ComponentProps<'code'>,
    VariantProps<typeof codeVariants> {
  /** When variant="block", wraps content in <pre> for proper formatting */
  asBlock?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Code
 *
 * Inline or block code component using theme monospace typography.
 * For block code, wraps in <pre> for proper whitespace preservation.
 *
 * @example
 * <Code>npm install @base-ui/react</Code>
 *
 * <Code variant="block">
 *   {`function hello() {\n  return "world";\n}`}
 * </Code>
 */
function Code({
  className,
  variant = 'inline',
  children,
  ...props
}: CodeProps) {
  const content = (
    <code
      className={cn(codeVariants({ variant }), className)}
      {...props}
    >
      {children}
    </code>
  );

  if (variant === 'block') {
    return <pre className="contents">{content}</pre>;
  }

  return content;
}

export { Code, codeVariants };
