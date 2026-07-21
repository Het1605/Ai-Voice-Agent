'use client';

import type React from 'react';

// ─── Positions ────────────────────────────────────────────────────────────────

/**
 * Well-defined positions where extensions can render.
 * Each maps to a specific location in the shell layout.
 */
export type ExtensionPosition =
  | 'sidebar-header'    // Above nav items (org switcher, team selector)
  | 'sidebar-footer'    // Below nav items (help, theme toggle)
  | 'header-left'       // Far left of header (search trigger)
  | 'header-center'     // Center of header (breadcrumbs compete here)
  | 'header-right'      // Far right of header (notifications, user menu)
  | 'overlay';          // Full-viewport overlays (command palette, search dialog)

// ─── Extension Definition ─────────────────────────────────────────────────────

export interface ShellExtension {
  /** Unique extension identifier */
  id: string;
  /** Where in the shell this extension renders */
  position: ExtensionPosition;
  /** The component/element to render */
  component: React.ReactNode;
  /** Sort order within its position (lower = first). Default 100. */
  order?: number;
  /** Only render if the user has the required permission */
  requiredPermission?: string;
  /** Only render if the feature flag is enabled */
  requiredFeatureFlag?: string;
}

// ─── Registry Storage ─────────────────────────────────────────────────────────

/**
 * In-memory extension registry.
 * Extensions are registered at the AppShellProvider level.
 */
export class ShellExtensionRegistry {
  private extensions: ShellExtension[] = [];

  /** Register one or more extensions. */
  register(exts: ShellExtension[]): void {
    for (const ext of exts) {
      // Replace existing extension with the same id
      const idx = this.extensions.findIndex((e) => e.id === ext.id);
      if (idx >= 0) {
        this.extensions[idx] = ext;
      } else {
        this.extensions.push(ext);
      }
    }
  }

  /** Get all extensions for a position, sorted by order. */
  getByPosition(position: ExtensionPosition): ShellExtension[] {
    return this.extensions
      .filter((e) => e.position === position)
      .sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
  }

  /** Get all registered extensions. */
  getAll(): ShellExtension[] {
    return [...this.extensions];
  }

  /** Remove an extension by id. */
  unregister(id: string): void {
    this.extensions = this.extensions.filter((e) => e.id !== id);
  }

  /** Clear all extensions. */
  clear(): void {
    this.extensions = [];
  }
}
