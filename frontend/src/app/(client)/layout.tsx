'use client';

import { AppShellProvider, ShellSidebar, ShellHeader } from '@/components/shell';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
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
