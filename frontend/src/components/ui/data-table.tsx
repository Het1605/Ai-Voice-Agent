'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { LoadingSkeleton } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import type React from 'react';
import type { LucideIcon } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SortDirection = 'asc' | 'desc';

export interface ColumnDef<T> {
  /** Column header label */
  header: string;
  /** Accessor key or function to extract cell value */
  accessor: keyof T | ((row: T) => string | number | React.ReactNode);
  /** Sort key (only sorts if provided) */
  sortKey?: string;
  /** Custom cell renderer */
  cell?: (row: T) => React.ReactNode;
  /** Column class name */
  className?: string;
  /** Hide on small screens */
  hideOnMobile?: boolean;
  /** Column header icon */
  icon?: LucideIcon;
}

export interface DataTableProps<T> {
  /** Column definitions */
  columns: ColumnDef<T>[];
  /** Data rows */
  data: T[];
  /** Unique row identifier (key or accessor) */
  rowKey: keyof T | ((row: T) => string | number);
  /** Loading state */
  loading?: boolean;
  /** Error state message */
  error?: string;
  /** Called when the user retries after error */
  onRetry?: () => void;
  /** Empty state configuration */
  empty?: {
    icon?: LucideIcon;
    title?: string;
    description?: string;
    action?: React.ReactNode;
  };
  /** Enable client-side sorting */
  sortable?: boolean;
  /** Initial sort column */
  initialSortKey?: string;
  /** Initial sort direction */
  initialSortDir?: SortDirection;
  /** Called when sort changes (for server-side sorting) */
  onSortChange?: (key: string, dir: SortDirection) => void;
  /** Enable pagination */
  paginated?: boolean;
  /** Rows per page */
  pageSize?: number;
  /** Current page (controlled, for server-side pagination) */
  currentPage?: number;
  /** Total pages (for server-side pagination) */
  totalPages?: number;
  /** Called when page changes (for server-side) */
  onPageChange?: (page: number) => void;
  /** Row class name */
  rowClassName?: string | ((row: T, index: number) => string);
  /** Additional wrapper class */
  className?: string;
  /** Whether the table is bare (no wrapper) */
  bare?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * DataTable
 *
 * Higher-level table with sorting, pagination, loading, empty, and error states.
 * Can work in client or server mode.
 *
 * @example
 * <DataTable
 *   columns={[
 *     { header: 'Name', accessor: 'name', sortKey: 'name' },
 *     { header: 'Status', accessor: 'status', cell: (r) => <StatusBadge variant={r.status} /> },
 *   ]}
 *   data={agents}
 *   rowKey="id"
 *   sortable
 *   paginated
 *   pageSize={10}
 * />
 */
function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  rowKey,
  loading = false,
  error,
  onRetry,
  empty,
  sortable = false,
  initialSortKey,
  initialSortDir = 'asc',
  onSortChange,
  paginated = false,
  pageSize = 10,
  currentPage: controlledPage,
  totalPages: controlledTotalPages,
  onPageChange,
  rowClassName,
  className,
  bare = false,
}: DataTableProps<T>) {
  // ── Client-side sort state ─────────────────────────────────────────────
  const [localSortKey, setLocalSortKey] = useState<string | undefined>(initialSortKey);
  const [localSortDir, setLocalSortDir] = useState<SortDirection>(initialSortDir);
  const [localPage, setLocalPage] = useState(1);

  const activeSortKey = onSortChange ? undefined : localSortKey;
  const activeSortDir = onSortChange ? undefined : localSortDir;
  const activePage = controlledPage ?? localPage;

  // ── Sorting (client-side) ──────────────────────────────────────────────
  const sortedData = useMemo(() => {
    if (!activeSortKey || onSortChange) return data;
    return [...data].sort((a, b) => {
      const aVal = String(a[activeSortKey] ?? '');
      const bVal = String(b[activeSortKey] ?? '');
      const cmp = aVal.localeCompare(bVal);
      return activeSortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, activeSortKey, activeSortDir, onSortChange]);

  // ── Pagination (client-side) ───────────────────────────────────────────
  const totalPages = controlledTotalPages ?? Math.ceil(sortedData.length / pageSize);
  const pageData = useMemo(() => {
    if (controlledTotalPages !== undefined || onPageChange) return sortedData;
    const start = (activePage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, activePage, pageSize, controlledTotalPages, onPageChange]);

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleSort = useCallback((key: string) => {
    if (!sortable) return;
    setLocalSortKey((prev) => {
      if (prev === key) {
        setLocalSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        return key;
      }
      setLocalSortDir('asc');
      return key;
    });
    onSortChange?.(key, localSortDir === 'asc' ? 'desc' : 'asc');
  }, [sortable, localSortDir, onSortChange]);

  const handlePageChange = useCallback((page: number) => {
    setLocalPage(page);
    onPageChange?.(page);
  }, [onPageChange]);

  const getRowKey = useCallback(
    (row: T, index: number): string | number => {
      if (typeof rowKey === 'function') return rowKey(row);
      return String(row[rowKey]);
    },
    [rowKey]
  );

  const getRowClassName = useCallback(
    (row: T, index: number): string => {
      if (typeof rowClassName === 'function') return rowClassName(row, index);
      return rowClassName ?? '';
    },
    [rowClassName]
  );

  // ── Render: Error State ────────────────────────────────────────────────
  if (error) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <EmptyState
          title="Failed to load data"
          description={error}
          action={onRetry && <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
          >
            Try again
          </Button>}
        />
      </div>
    );
  }

  // ── Render: Loading State ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className={cn('space-y-3', className)}>
        <LoadingSkeleton variant="table-row" rows={pageSize > 5 ? 5 : pageSize} />
      </div>
    );
  }

  // ── Render: Empty State ────────────────────────────────────────────────
  if (!pageData.length) {
    return (
      <div className={cn('', className)}>
        <EmptyState
          icon={empty?.icon}
          title={empty?.title ?? 'No data'}
          description={empty?.description}
          action={empty?.action}
        />
      </div>
    );
  }

  // ── Render: Table ──────────────────────────────────────────────────────
  const TableTag = bare ? 'table' : 'div';
  const tableClasses = bare
    ? cn('w-full caption-bottom text-sm', className)
    : cn('relative w-full overflow-x-auto', className);

  return (
    <div className={cn(!bare && 'space-y-4')}>
      <div className={tableClasses}>
        <table className="w-full caption-bottom text-sm">
          {/* Header */}
          <thead>
            <tr className="border-b border-border">
              {columns.map((col, i) => {
                const SortIcon = activeSortKey === col.sortKey
                  ? activeSortDir === 'asc' ? ArrowUp : ArrowDown
                  : ArrowUpDown;

                return (
                  <th
                    key={col.header + i}
                    className={cn(
                      'h-10 px-3 text-left align-middle font-medium whitespace-nowrap text-muted-foreground',
                      col.hideOnMobile && 'hidden md:table-cell',
                      col.sortKey && sortable && 'cursor-pointer select-none hover:text-foreground',
                      col.className,
                    )}
                    onClick={() => col.sortKey && handleSort(col.sortKey)}
                  >
                    <div className="flex items-center gap-1.5">
                      {col.icon && <col.icon className="h-3.5 w-3.5" />}
                      <span>{col.header}</span>
                      {col.sortKey && sortable && (
                        <SortIcon className="h-3.5 w-3.5" />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {pageData.map((row, rowIndex) => (
              <tr
                key={getRowKey(row, rowIndex)}
                className={cn(
                  'border-b border-border transition-colors hover:bg-muted/50',
                  getRowClassName(row, rowIndex),
                )}
              >
                {columns.map((col, colIndex) => {
                  const cellValue =
                    typeof col.accessor === 'function'
                      ? col.accessor(row)
                      : row[col.accessor];

                  return (
                    <td
                      key={col.header + colIndex}
                      className={cn(
                        'p-3 align-middle',
                        col.hideOnMobile && 'hidden md:table-cell',
                        col.className,
                      )}
                    >
                      {col.cell ? col.cell(row) : (cellValue as React.ReactNode)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {paginated && totalPages > 1 && (
        <Pagination className="justify-end">
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="ghost"
                size="sm"
                disabled={activePage <= 1}
                onClick={() => handlePageChange(activePage - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
            </PaginationItem>

            {generatePageNumbers(activePage, totalPages).map((page, i) =>
              page === 'ellipsis' ? (
                <PaginationItem key={`e${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={page === activePage}
                    onClick={() => handlePageChange(page as number)}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <Button
                variant="ghost"
                size="sm"
                disabled={activePage >= totalPages}
                onClick={() => handlePageChange(activePage + 1)}
                aria-label="Next page"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generatePageNumbers(
  current: number,
  total: number,
): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [1];

  if (current > 3) pages.push('ellipsis');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('ellipsis');

  if (total > 1) pages.push(total);

  return pages;
}

export { DataTable };
