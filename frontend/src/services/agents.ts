/**
 * Agents Service
 *
 * API call functions for agent configuration endpoints.
 */
import apiClient from '@/lib/api-client';
import type { Agent, AgentCreate, AgentUpdate } from '@/types/domain';
import type { ApiResponse } from '@/lib/api-client';

export const agentService = {
  async list(orgId: string): Promise<Agent[]> {
    const res = await apiClient.get(`/organizations/${orgId}/agents`) as ApiResponse<Agent[]>;
    return res.data;
  },

  async getById(orgId: string, agentId: string): Promise<Agent> {
    const res = await apiClient.get(`/organizations/${orgId}/agents/${agentId}`) as ApiResponse<Agent>;
    return res.data;
  },

  async create(orgId: string, data: AgentCreate): Promise<Agent> {
    const res = await apiClient.post(`/organizations/${orgId}/agents`, data) as ApiResponse<Agent>;
    return res.data;
  },

  async update(orgId: string, agentId: string, data: AgentUpdate): Promise<Agent> {
    const res = await apiClient.patch(`/organizations/${orgId}/agents/${agentId}`, data) as ApiResponse<Agent>;
    return res.data;
  },

  async delete(orgId: string, agentId: string): Promise<void> {
    await apiClient.delete(`/organizations/${orgId}/agents/${agentId}`);
  },
};
