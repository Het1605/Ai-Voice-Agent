import {
  LayoutDashboard,
  Bot,
  Phone,
  BookOpen,
  BarChart3,
  Users,
  CreditCard,
  Puzzle,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { ROUTES } from '@/config/constants';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  /** If set, item is only visible to users with this role */
  requiredRole?: string;
  /** Sub-navigation items */
  children?: Omit<NavItem, 'icon' | 'children'>[];
  disabled?: boolean;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

/** ─── Client Portal Navigation ─────────────────────────────────────────── */
export const clientNavigation: NavSection[] = [
  {
    items: [
      {
        title: 'Dashboard',
        href: ROUTES.client.dashboard,
        icon: LayoutDashboard,
      },
      {
        title: 'Agents',
        href: ROUTES.client.agents,
        icon: Bot,
      },
      {
        title: 'Calls',
        href: ROUTES.client.calls,
        icon: Phone,
      },
      {
        title: 'Knowledge',
        href: ROUTES.client.knowledge,
        icon: BookOpen,
      },
      {
        title: 'Analytics',
        href: ROUTES.client.analytics,
        icon: BarChart3,
      },
    ],
  },
  {
    title: 'Organization',
    items: [
      {
        title: 'Team',
        href: ROUTES.client.team,
        icon: Users,
      },
      {
        title: 'Billing',
        href: ROUTES.client.billing,
        icon: CreditCard,
      },
      {
        title: 'Integrations',
        href: ROUTES.client.integrations,
        icon: Puzzle,
      },
      {
        title: 'Settings',
        href: ROUTES.client.settings,
        icon: Settings,
      },
    ],
  },
];

/** ─── Agent Workspace Tabs ──────────────────────────────────────────────── */
export interface AgentTab {
  key: string;
  title: string;
  href: (agentId: string) => string;
}

export const agentWorkspaceTabs: AgentTab[] = [
  { key: 'overview',   title: 'Overview',   href: (id) => `/agents/${id}/overview` },
  { key: 'prompt',     title: 'Prompt',     href: (id) => `/agents/${id}/prompt` },
  { key: 'knowledge',  title: 'Knowledge',  href: (id) => `/agents/${id}/knowledge` },
  { key: 'voice',      title: 'Voice',      href: (id) => `/agents/${id}/voice` },
  { key: 'tools',      title: 'Tools',      href: (id) => `/agents/${id}/tools` },
  { key: 'variables',  title: 'Variables',  href: (id) => `/agents/${id}/variables` },
  { key: 'testing',    title: 'Testing',    href: (id) => `/agents/${id}/testing` },
  { key: 'calls',      title: 'Calls',      href: (id) => `/agents/${id}/calls` },
  { key: 'analytics',  title: 'Analytics',  href: (id) => `/agents/${id}/analytics` },
  { key: 'versions',   title: 'Versions',   href: (id) => `/agents/${id}/versions` },
  { key: 'deploy',     title: 'Deploy',     href: (id) => `/agents/${id}/deploy` },
];
