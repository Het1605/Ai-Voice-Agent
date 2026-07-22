'use client';

import { AdminLayout } from '@/components/layout';
import { RouteGuard, AppShellProvider } from '@/components/shell';
import { PageContainer, ContentContainer, PageHeader } from '@/components/layout';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard onDenied="redirect" redirectTo="/dashboard">
      <AppShellProvider>
        <AdminLayout hideSidebar>
          <PageContainer>
            <ContentContainer>
              {children}
            </ContentContainer>
          </PageContainer>
        </AdminLayout>
      </AppShellProvider>
    </RouteGuard>
  );
}
