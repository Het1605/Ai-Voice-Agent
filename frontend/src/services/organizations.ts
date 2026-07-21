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
import type { ApiResponse } from '@/lib/api-client';

export const organizationService = {
  async create(data: OrganizationCreate): Promise<Organization> {
    const res = await apiClient.post('/organizations', data) as ApiResponse<Organization>;
    return res.data;
  },

  async list(): Promise<Organization[]> {
    const res = await apiClient.get('/organizations') as ApiResponse<Organization[]>;
    return res.data;
  },

  async getMyOrganizations(): Promise<OrganizationMemberWithOrg[]> {
    const res = await apiClient.get('/organizations/me') as ApiResponse<OrganizationMemberWithOrg[]>;
    return res.data;
  },

  async getById(orgId: string): Promise<Organization> {
    const res = await apiClient.get(`/organizations/${orgId}`) as ApiResponse<Organization>;
    return res.data;
  },

  async update(orgId: string, data: OrganizationUpdate): Promise<Organization> {
    const res = await apiClient.patch(`/organizations/${orgId}`, data) as ApiResponse<Organization>;
    return res.data;
  },

  async getMembers(orgId: string): Promise<OrganizationMember[]> {
    const res = await apiClient.get(`/organizations/${orgId}/members`) as ApiResponse<OrganizationMember[]>;
    return res.data;
  },

  async activate(orgId: string): Promise<Organization> {
    const res = await apiClient.post(`/organizations/${orgId}/activate`) as ApiResponse<Organization>;
    return res.data;
  },

  async deactivate(orgId: string): Promise<Organization> {
    const res = await apiClient.post(`/organizations/${orgId}/deactivate`) as ApiResponse<Organization>;
    return res.data;
  },
};
