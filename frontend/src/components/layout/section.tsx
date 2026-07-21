'use client';

import { cn } from '@/lib/utils';
import type React from 'react';

// ─── Section ──────────────────────────────────────────────────────────────────

export interface SectionProps {
  children: React.ReactNode;
  className?: string;
  /** Semantic element type (default div) */
  as?: 'div' | 'section' | 'article' | 'fieldset';
  /** Apply card elevation shadow */
  elevated?: boolean;
  /** Show a border around the section */
  bordered?: boolean;
}

/**
 * Section
 *
 * Card-like grouped content block with consistent background, padding,
 * and border treatment. The primary way to organize page content.
 *
 * Examples: form groups, stats panels, list containers.
 */
export function Section({
  children,
  className,
  as: Tag = 'div',
  elevated = false,
  bordered = true,
}: SectionProps) {
  return (
    <Tag
      className={cn(
        'rounded-lg border bg-card text-card-foreground',
        'p-4 sm:p-6',
        elevated && 'shadow-sm',
        bordered && 'border-border',
        !bordered && 'border-transparent',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

export interface SectionHeaderProps {
  /** Section title */
  title: string;
  /** Optional description rendered below the title */
  description?: string;
  /** Action elements rendered on the right side */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * SectionHeader
 *
 * Title, description, and optional actions for a Section.
 * Wrap with Section for the full card pattern.
 */
export function SectionHeader({
  title,
  description,
  actions,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between',
        // Add bottom spacing when followed by SectionContent
        'mb-4',
        className,
      )}
    >
      <div className="min-w-0 flex-1 space-y-0.5">
        <h3 className="text-base font-semibold leading-6 text-foreground">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

// ─── SectionContent ───────────────────────────────────────────────────────────

export interface SectionContentProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * SectionContent
 *
 * Body area of a Section, separated from the header.
 * Use when SectionHeader + SectionContent composition is cleaner
 * than putting everything directly in Section.
 */
export function SectionContent({
  children,
  className,
}: SectionContentProps) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  );
}
