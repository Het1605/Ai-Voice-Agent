/**
 * Organizations Service
 *
 * API call functions for organization and membership endpoints.
 */
import apiClient from '@/lib/api-client';
import type {
  Organization,
  OrganizationCreate,
  OrganizationUpdate,
  OrganizationMember,
  OrganizationMemberWithOrg,
} from '@/types/domain';
export const organizationService = {
  async create(data: OrganizationCreate): Promise<Organization> {
    const response = await apiClient.post('/organizations', data) as Organization;
    return response;
  },

  async list(): Promise<Organization[]> {
    const response = await apiClient.get('/organizations') as Organization[];
    return response;
  },

  async getMyOrganizations(): Promise<OrganizationMemberWithOrg[]> {
    const response = await apiClient.get('/organizations/me') as OrganizationMemberWithOrg[];
    return response;
  },

  async getById(orgId: string): Promise<Organization> {
    const response = await apiClient.get(`/organizations/${orgId}`) as Organization;
    return response;
  },

  async update(orgId: string, data: OrganizationUpdate): Promise<Organization> {
    const response = await apiClient.patch(`/organizations/${orgId}`, data) as Organization;
    return response;
  },

  async getMembers(orgId: string): Promise<OrganizationMember[]> {
    const response = await apiClient.get(`/organizations/${orgId}/members`) as OrganizationMember[];
    return response;
  },

  async activate(orgId: string): Promise<Organization> {
    const response = await apiClient.post(`/organizations/${orgId}/activate`) as Organization;
    return response;
  },

  async deactivate(orgId: string): Promise<Organization> {
    const response = await apiClient.post(`/organizations/${orgId}/deactivate`) as Organization;
    return response;
  },
};
