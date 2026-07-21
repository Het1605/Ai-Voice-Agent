/**
 * Agent Hooks
 *
 * React Query hooks for agent configuration CRUD operations.
 *
 * Dependency flow:
 *   Component → useAgent → agentService → apiClient → Backend
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { agentService } from '@/services/agents';
import type { AgentCreate, AgentUpdate } from '@/types/domain';

// ─── Query Keys ──────────────────────────────────────────────────────────

export const agentKeys = {
  all: (orgId: string) => ['organizations', orgId, 'agents'] as const,
  list: (orgId: string) => [...agentKeys.all(orgId), 'list'] as const,
  detail: (orgId: string, agentId: string) =>
    [...agentKeys.all(orgId), 'detail', agentId] as const,
};

// ─── Hooks ───────────────────────────────────────────────────────────────

/** List all agents in an organization. */
export function useAgents(orgId: string) {
  return useQuery({
    queryKey: agentKeys.list(orgId),
    queryFn: () => agentService.list(orgId),
    enabled: !!orgId,
  });
}

/** Fetch a single agent by ID. */
export function useAgent(orgId: string, agentId: string) {
  return useQuery({
    queryKey: agentKeys.detail(orgId, agentId),
    queryFn: () => agentService.getById(orgId, agentId),
    enabled: !!orgId && !!agentId,
  });
}

/** Create a new agent. */
export function useCreateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, data }: { orgId: string; data: AgentCreate }) =>
      agentService.create(orgId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.list(variables.orgId) });
    },
  });
}

/** Update an existing agent. */
export function useUpdateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orgId,
      agentId,
      data,
    }: {
      orgId: string;
      agentId: string;
      data: AgentUpdate;
    }) => agentService.update(orgId, agentId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: agentKeys.detail(variables.orgId, variables.agentId),
      });
      queryClient.invalidateQueries({ queryKey: agentKeys.list(variables.orgId) });
    },
  });
}

/** Delete an agent. */
export function useDeleteAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, agentId }: { orgId: string; agentId: string }) =>
      agentService.delete(orgId, agentId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.list(variables.orgId) });
    },
  });
}
