export const APP_CONFIG = {
  name: "AI Voice Gateway",
  description: "Enterprise-grade AI Voice Agent SaaS Platform",
  url: "https://voicegateway.com",
};

export const ROUTES = {
  auth: {
    login: "/login",
    register: "/register",
    forgotPassword: "/forgot-password",
  },
  admin: {
    dashboard: "/admin/dashboard",
    organizations: "/admin/organizations",
    users: "/admin/users",
    providers: "/admin/providers",
    auditLogs: "/admin/audit-logs",
  },
  client: {
    dashboard: '/dashboard',
    agents: '/agents',
    knowledge: '/knowledge',
    calls: '/calls',
    analytics: '/analytics',
    team: '/team',
    billing: '/billing',
    integrations: '/integrations',
    settings: '/settings',
  }
};

export const STORAGE_KEYS = {
  JWT_TOKEN: "vg_jwt_token",
  ACTIVE_ORG_ID: "vg_active_org_id",
  THEME: "vg_theme",
};
