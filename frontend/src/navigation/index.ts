/**
 * Navigation — barrel export
 *
 * Replaces the old client-nav.ts. All route definitions,
 * permissions, and navigation hooks export from here.
 */
export { routes, agentWorkspaceTabs, groupRoutes, getRouteById, getRouteByHref, getRouteChain } from './routes';
export type { RouteDefinition, AgentTabDefinition } from './routes';

export { hasPermission, getRoleLabel } from './permissions';
export type { PermissionRole } from './permissions';

export { useNavigation } from './use-navigation';
export type { UseNavigationReturn, NavigationGroup } from './use-navigation';
