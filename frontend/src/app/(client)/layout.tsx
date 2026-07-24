'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShellProvider, ShellSidebar, ShellHeader } from '@/components/shell';
import { useAuthStore } from '@/store/auth-store';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const isRestoring = useAuthStore((s) => s.isRestoring);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isRestoring && !accessToken) {
      router.push('/login');
    }
  }, [isRestoring, accessToken, router]);

  // Don't render anything while restoring or if not authenticated
  if (isRestoring || !accessToken) {
    return null;
  }

  return (
    <AppShellProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <ShellSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <ShellHeader />
          <main className="flex-1 overflow-y-auto">
            <div className="animate-in-fade">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AppShellProvider>
  );
}
