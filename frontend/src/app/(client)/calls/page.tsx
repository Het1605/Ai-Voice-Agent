'use client';

import { PageContainer, ContentContainer, PageHeader, Section, SectionHeader } from '@/components/layout';
import { EmptyState } from '@/components/ui/empty-state';
import { Phone, PhoneOff } from 'lucide-react';

export default function CallsPage() {
  return (
    <PageContainer>
      <ContentContainer>
        <PageHeader
          title="Calls"
          description="Browse your conversation history and recordings."
        />

        <Section>
          <SectionHeader
            title="Call History"
            description="All incoming and outgoing calls"
          />
          <EmptyState
            icon={PhoneOff}
            title="No calls yet"
            description="Call logs will appear here once your agents start handling calls."
            action={undefined}
          />
        </Section>
      </ContentContainer>
    </PageContainer>
  );
}
