import { apiFetch } from './api';

export interface Organization {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  user_id: string;
  organization_id: string;
  role: string;
  joined_at: string;
}

export interface OrganizationCreateData {
  name: string;
}

export interface OrganizationUpdateData {
  name?: string;
  is_active?: boolean;
}

export const organizationService = {
  // Get all organizations the current user belongs to
  getMyOrganizations: async (): Promise<OrganizationMember[]> => {
    return apiFetch('/organizations/me');
  },

  // Get organization details by ID
  getOrganization: async (orgId: string): Promise<Organization> => {
    return apiFetch(`/organizations/${orgId}`);
  },

  // Create a new organization
  createOrganization: async (data: OrganizationCreateData): Promise<Organization> => {
    return apiFetch('/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update organization
  updateOrganization: async (orgId: string, data: OrganizationUpdateData): Promise<Organization> => {
    return apiFetch(`/organizations/${orgId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Get members of an organization
  getOrganizationMembers: async (orgId: string): Promise<OrganizationMember[]> => {
    return apiFetch(`/organizations/${orgId}/members`);
  },
};
