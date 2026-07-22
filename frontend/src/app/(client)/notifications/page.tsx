'use client';

import { PageContainer, ContentContainer, PageHeader } from '@/components/layout';
import { Section, SectionHeader } from '@/components/layout';
import { EmptyState } from '@/components/ui/empty-state';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <PageContainer>
      <ContentContainer>
        <PageHeader
          title="Notifications"
          description="View your notification history."
        />
        <Section>
          <SectionHeader
            title="Recent Notifications"
            description="All platform notifications in chronological order"
          />
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="Notifications about calls, team activity, and platform updates will appear here."
          />
        </Section>
      </ContentContainer>
    </PageContainer>
  );
}
