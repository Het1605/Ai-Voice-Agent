/**
 * Permissions
 *
 * Role-based access control constants and helpers.
 * NO authorization logic — just role comparison utilities
 * and the role hierarchy definition.
 *
 * Hierarchy: guest < member < admin < owner
 */

// ─── Types ────────────────────────────────────────────────────────────────────

/** Ordered from lowest to highest privilege */
export type PermissionRole = 'guest' | 'member' | 'admin' | 'owner';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Numeric hierarchy — higher index = higher privilege */
export const ROLE_HIERARCHY: Record<PermissionRole, number> = {
  guest: 0,
  member: 1,
  admin: 2,
  owner: 3,
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Check whether the user's role satisfies a minimum required role.
 *
 * Pure function — no store access, no side effects.
 *
 * @example
 * hasPermission('member', 'admin')    // false
 * hasPermission('owner', 'admin')     // true
 * hasPermission('admin', undefined)   // true (no restriction)
 */
export function hasPermission(
  userRole: PermissionRole | undefined | null,
  requiredRole: PermissionRole | undefined | null,
): boolean {
  if (!requiredRole) return true;
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Get the label for a role, suitable for display.
 */
export function getRoleLabel(role: PermissionRole): string {
  const labels: Record<PermissionRole, string> = {
    guest: 'Guest',
    member: 'Member',
    admin: 'Admin',
    owner: 'Owner',
  };
  return labels[role];
}
