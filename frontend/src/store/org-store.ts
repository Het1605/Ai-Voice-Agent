/**
 * Organization Store
 *
 * Manages the currently active organization context.
 * Multi-tenant operations depend on this state.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Organization } from '@/types/domain';
import { STORAGE_KEYS } from '@/config/constants';

interface OrgState {
  /** Organizations the current user belongs to */
  organizations: Organization[];
  /** The currently active organization */
  activeOrganization: Organization | null;
  /** Whether organizations are being loaded */
  isLoading: boolean;

  // Actions
  setOrganizations: (orgs: Organization[]) => void;
  setActiveOrganization: (org: Organization) => void;
  setLoading: (loading: boolean) => void;
  clearOrganizations: () => void;
}

export const useOrgStore = create<OrgState>()(
  persist(
    (set) => ({
      organizations: [],
      activeOrganization: null,
      isLoading: false,

      setOrganizations: (organizations) => set({ organizations }),
      setActiveOrganization: (org) => set({ activeOrganization: org }),
      setLoading: (isLoading) => set({ isLoading }),

      clearOrganizations: () =>
        set({
          organizations: [],
          activeOrganization: null,
        }),
    }),
    {
      name: STORAGE_KEYS.ACTIVE_ORG_ID,
      partialize: (state) => ({
        activeOrganization: state.activeOrganization,
      }),
    }
  )
);
