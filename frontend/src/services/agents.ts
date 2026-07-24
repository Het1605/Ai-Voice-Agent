/**
 * Agents Service
 *
 * API call functions for agent configuration endpoints.
 */
import apiClient from '@/lib/api-client';
import type { Agent, AgentCreate, AgentUpdate } from '@/types/domain';
export const agentService = {
  async list(orgId: string): Promise<Agent[]> {
    const response = await apiClient.get(`/organizations/${orgId}/agents`) as Agent[];
    return response;
  },

  async getById(orgId: string, agentId: string): Promise<Agent> {
    const response = await apiClient.get(`/organizations/${orgId}/agents/${agentId}`) as Agent;
    return response;
  },

  async create(orgId: string, data: AgentCreate): Promise<Agent> {
    const response = await apiClient.post(`/organizations/${orgId}/agents`, data) as Agent;
    return response;
  },

  async update(orgId: string, agentId: string, data: AgentUpdate): Promise<Agent> {
    const response = await apiClient.patch(`/organizations/${orgId}/agents/${agentId}`, data) as Agent;
    return response;
  },

  async delete(orgId: string, agentId: string): Promise<void> {
    await apiClient.delete(`/organizations/${orgId}/agents/${agentId}`);
  },
};
