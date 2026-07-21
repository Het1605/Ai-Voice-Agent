/**
 * Shell Store
 *
 * UI state specific to the application shell:
 * sidebar collapse, group expansion, and breadcrumb overrides.
 *
 * Kept separate from ui-store to avoid coupling layout primitives
 * to application-level concerns.
 */
import { create } from 'zustand';

interface ShellState {
  // ── Sidebar ─────────────────────────────────────────────────────────
  /** Whether the sidebar is collapsed */
  collapsed: boolean;

  /** Set of sidebar group names that are currently expanded */
  expandedGroups: Set<string>;

  // ── Breadcrumb overrides ────────────────────────────────────────────
  /** Override labels for specific breadcrumb segments, keyed by route id */
  breadcrumbOverrides: Record<string, string>;

  // ── Agent workspace ─────────────────────────────────────────────────
  /** Currently active agent tab key (for agent workspace sidebar) */
  activeAgentTab?: string;

  // ── Actions ─────────────────────────────────────────────────────────
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  toggleGroup: (group: string) => void;
  setGroupExpanded: (group: string, expanded: boolean) => void;
  setBreadcrumbOverride: (routeId: string, label: string) => void;
  clearBreadcrumbOverrides: () => void;
  setActiveAgentTab: (tab: string | undefined) => void;
}

export const useShellStore = create<ShellState>()((set) => ({
  collapsed: false,
  expandedGroups: new Set<string>(['main', 'org', 'admin']),
  breadcrumbOverrides: {},
  activeAgentTab: undefined,

  toggleCollapsed: () =>
    set((state) => ({ collapsed: !state.collapsed })),

  setCollapsed: (collapsed) => set({ collapsed }),

  toggleGroup: (group) =>
    set((state) => {
      const next = new Set(state.expandedGroups);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return { expandedGroups: next };
    }),

  setGroupExpanded: (group, expanded) =>
    set((state) => {
      const next = new Set(state.expandedGroups);
      if (expanded) {
        next.add(group);
      } else {
        next.delete(group);
      }
      return { expandedGroups: next };
    }),

  setBreadcrumbOverride: (routeId, label) =>
    set((state) => ({
      breadcrumbOverrides: { ...state.breadcrumbOverrides, [routeId]: label },
    })),

  clearBreadcrumbOverrides: () => set({ breadcrumbOverrides: {} }),

  setActiveAgentTab: (tab) => set({ activeAgentTab: tab }),
}));
