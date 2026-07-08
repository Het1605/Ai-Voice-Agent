import { apiFetch } from './api';

export interface AgentBase {
  name: string;
  description?: string;
  is_active?: boolean;
  default_language?: string;
  system_prompt?: string;
}

export interface Agent extends AgentBase {
  id: string;
  organization_id: string;
  created_by_id?: string;
  created_at: string;
  updated_at: string;
}

export const agentService = {
  // Create an Agent
  createAgent: async (orgId: string, data: AgentBase): Promise<Agent> => {
    return apiFetch(`/organizations/${orgId}/agents`, {
      method: 'POST',
      body: JSON.stringify({ ...data, organization_id: orgId }),
    });
  },

  // List Agents for an Organization
  listAgents: async (orgId: string): Promise<Agent[]> => {
    return apiFetch(`/organizations/${orgId}/agents`);
  },

  // Get a specific Agent
  getAgent: async (orgId: string, agentId: string): Promise<Agent> => {
    return apiFetch(`/organizations/${orgId}/agents/${agentId}`);
  },

  // Update an Agent
  updateAgent: async (orgId: string, agentId: string, data: Partial<AgentBase>): Promise<Agent> => {
    return apiFetch(`/organizations/${orgId}/agents/${agentId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Deactivate/Delete an Agent
  deleteAgent: async (orgId: string, agentId: string): Promise<Agent> => {
    return apiFetch(`/organizations/${orgId}/agents/${agentId}`, {
      method: 'DELETE',
    });
  },
};
