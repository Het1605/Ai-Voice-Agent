/**
 * Organization Hooks
 *
 * React Query hooks for organization and membership operations.
 *
 * Dependency flow:
 *   Component → useOrganization → organizationService → apiClient → Backend
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { organizationService } from '@/services/organizations';
import { useOrgStore } from '@/store/org-store';
import type { Organization, OrganizationCreate, OrganizationUpdate } from '@/types/domain';

// ─── Query Keys ──────────────────────────────────────────────────────────

export const orgKeys = {
  all: ['organizations'] as const,
  list: () => [...orgKeys.all, 'list'] as const,
  detail: (id: string) => [...orgKeys.all, 'detail', id] as const,
  members: (id: string) => [...orgKeys.all, 'members', id] as const,
  mine: () => [...orgKeys.all, 'mine'] as const,
};

// ─── Hooks ───────────────────────────────────────────────────────────────

/** Fetch organizations the current user belongs to. */
export function useMyOrganizations() {
  const { setOrganizations } = useOrgStore();

  return useQuery({
    queryKey: orgKeys.mine(),
    queryFn: async () => {
      const memberships = await organizationService.getMyOrganizations();
      const orgs = memberships.map((m) => m.organization);
      setOrganizations(orgs);
      return orgs;
    },
    staleTime: 1000 * 60 * 5,
  });
}

/** Fetch a single organization by ID. */
export function useOrganization(orgId: string) {
  return useQuery({
    queryKey: orgKeys.detail(orgId),
    queryFn: () => organizationService.getById(orgId),
    enabled: !!orgId,
  });
}

/** Fetch all members of an organization. */
export function useOrganizationMembers(orgId: string) {
  return useQuery({
    queryKey: orgKeys.members(orgId),
    queryFn: () => organizationService.getMembers(orgId),
    enabled: !!orgId,
  });
}

/** Create a new organization. */
export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OrganizationCreate) => organizationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.mine() });
    },
  });
}

/** Update an organization. */
export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: OrganizationUpdate }) =>
      organizationService.update(id, data),
    onSuccess: (org) => {
      queryClient.invalidateQueries({ queryKey: orgKeys.detail(org.id) });
      queryClient.invalidateQueries({ queryKey: orgKeys.mine() });
    },
  });
}
