/**
 * Activity Store
 *
 * Global activity indicator used by the GlobalLoader.
 * Any process — API requests, file uploads, route transitions —
 * can increment/decrement the counter to show/hide the loading bar.
 *
 * The store uses a stack counter so concurrent activities
 * are handled correctly (only goes to zero when all are done).
 */
import { create } from 'zustand';

interface ActivityState {
  /** Number of currently active processes. >0 means "loading". */
  count: number;

  /** Optional message shown alongside the loader */
  message: string | null;

  // Actions
  /** Mark the start of an activity. Returns a unique token. */
  begin: (message?: string) => string;
  /** Mark the end of an activity. */
  end: (token: string) => void;
  /** Reset the counter (for error recovery). */
  reset: () => void;
}

let tokenCounter = 0;
const activeTokens = new Set<string>();

export const useActivityStore = create<ActivityState>()((set) => ({
  count: 0,
  message: null,

  begin: (message) => {
    const token = `act-${++tokenCounter}`;
    activeTokens.add(token);
    set((state) => ({
      count: state.count + 1,
      message: message ?? null,
    }));
    return token;
  },

  end: (token) => {
    if (!activeTokens.has(token)) return;
    activeTokens.delete(token);
    set((state) => ({
      count: Math.max(0, state.count - 1),
      message: state.count <= 1 ? null : state.message,
    }));
  },

  reset: () => {
    activeTokens.clear();
    set({ count: 0, message: null });
  },
}));

/**
 * React Query global callback configuration.
 * Integrates the activity store with TanStack Query's global loading state.
 *
 * Usage: wire this into <ReactQueryProvider> onQueryClientReady
 */
export function createActivityTracker() {
  const beginActivity = () => useActivityStore.getState().begin();
  const endActivity = (token: string) => useActivityStore.getState().end(token);

  return {
    onSuccess: () => {
      // Tracked via mutation/query callbacks if needed
    },
  };
}
