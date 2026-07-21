/**
 * Domain Types
 *
 * Mirrors the backend domain schemas.
 * Single source of truth for entity shapes used across services, hooks, and stores.
 */

// ─── Shared ──────────────────────────────────────────────────────────────

export interface Timestamps {
  created_at: string;
  updated_at: string;
}

// ─── Auth ────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginResponse {
  user: User;
  tokens: TokenPair;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// ─── User ────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
  role: string;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Organization ────────────────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationCreate {
  name: string;
  is_active?: boolean;
}

export interface OrganizationUpdate {
  name?: string;
  is_active?: boolean;
}

export enum OrganizationRole {
  OWNER = "owner",
  ADMIN = "admin",
  MEMBER = "member",
}

export interface OrganizationMember {
  id: string;
  user_id: string;
  organization_id: string;
  role: OrganizationRole;
  joined_at: string;
}

export interface OrganizationMemberWithOrg extends OrganizationMember {
  organization: Organization;
}

// ─── Agent ───────────────────────────────────────────────────────────────

export interface Agent {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  default_language: string;
  system_prompt: string | null;
  organization_id: string;
  created_by_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgentCreate {
  name: string;
  description?: string;
  is_active?: boolean;
  default_language?: string;
  system_prompt?: string;
  organization_id: string;
}

export interface AgentUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
  default_language?: string;
  system_prompt?: string;
}
