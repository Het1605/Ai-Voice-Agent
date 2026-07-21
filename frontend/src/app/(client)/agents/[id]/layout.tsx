'use client';

import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { PageContainer } from '@/components/layout';
import { Separator } from '@/components/ui/separator';
import { agentWorkspaceTabs } from '@/navigation/routes';

export default function AgentWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const agentId = params.id as string;

  return (
    <PageContainer>
      {/* Agent workspace tab navigation */}
      <div className="mb-6 overflow-x-auto">
        <nav className="flex gap-1 min-w-max border-b border-border">
          {agentWorkspaceTabs.map((tab) => {
            const href = tab.href(agentId);
            const isActive = pathname === href;
            return (
              <Link
                key={tab.key}
                href={href}
                className={cn(
                  'relative px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {tab.title}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {children}
    </PageContainer>
  );
}
