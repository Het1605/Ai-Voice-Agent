import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="h-full p-6 animate-in-fade">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
