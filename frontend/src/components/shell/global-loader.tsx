'use client';

import { cn } from '@/lib/utils';
import { useActivityStore } from '@/store/activity-store';

export interface GlobalLoaderProps {
  /** Color of the load bar (default primary) */
  color?: string;
  /** Height in px (default 2) */
  height?: number;
  className?: string;
}

/**
 * GlobalLoader
 *
 * Slim progress bar at the top of the viewport that activates
 * whenever the global activity counter > 0.
 *
 * Driven by the activity-store, which any process can tap into:
 * - API request interceptors (auto-integrated)
 * - Route transitions
 * - File uploads / manual operations via `useActivityStore().begin()/.end()`
 *
 * @example
 * // In root layout:
 * <GlobalLoader />
 */
export function GlobalLoader({
  color,
  height = 2,
  className,
}: GlobalLoaderProps) {
  const count = useActivityStore((s) => s.count);
  const isActive = count > 0;

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-[var(--z-toast)] overflow-hidden',
        'transition-opacity duration-200',
        isActive ? 'opacity-100' : 'opacity-0',
        className,
      )}
      style={{ height: `${height}px` }}
      role="progressbar"
      aria-valuenow={isActive ? 1 : 0}
      aria-valuemin={0}
      aria-valuemax={1}
      aria-hidden={!isActive}
    >
      <div
        className={cn(
          'h-full w-1/3 animate-loader-slide rounded-full',
          color ?? 'bg-primary',
        )}
      />
    </div>
  );
}
