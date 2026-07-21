'use client';

import { create } from 'zustand';
import type { LucideIcon } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
  /** Unique toast ID (auto-generated) */
  id: string;
  /** Toast title */
  title?: string;
  /** Toast description */
  description?: string;
  /** Semantic variant (default info) */
  variant: ToastVariant;
  /** Custom icon override */
  icon?: LucideIcon;
  /** Duration in ms before auto-dismiss (default 5000, 0 = persistent) */
  duration: number;
  /** Timestamp when the toast was created */
  createdAt: number;
}

interface ToastState {
  toasts: Toast[];
  add: (toast: Omit<Toast, 'id' | 'createdAt'>) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

let toastCounter = 0;

// ─── Store ────────────────────────────────────────────────────────────────────

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  add: (toast) => {
    const id = `toast-${++toastCounter}-${Date.now()}`;
    set((state) => ({
      toasts: [
        ...state.toasts,
        { ...toast, id, createdAt: Date.now() },
      ],
    }));
    return id;
  },

  dismiss: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clear: () => {
    set({ toasts: [] });
  },
}));

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast() {
  const { add, dismiss, clear } = useToastStore();

  return {
    toast: (props: Omit<Toast, 'id' | 'createdAt'>) => add(props),
    dismiss,
    clear,
    info: (title?: string, description?: string) =>
      add({ title, description, variant: 'info', duration: 5000 }),
    success: (title?: string, description?: string) =>
      add({ title, description, variant: 'success', duration: 5000 }),
    warning: (title?: string, description?: string) =>
      add({ title, description, variant: 'warning', duration: 5000 }),
    error: (title?: string, description?: string) =>
      add({ title, description, variant: 'error', duration: 8000 }),
  };
}
