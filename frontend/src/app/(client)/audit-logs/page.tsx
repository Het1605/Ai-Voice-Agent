import { PageContainer, ContentContainer, PageHeader } from '@/components/layout';
import { Section, SectionHeader } from '@/components/layout';
import { EmptyState } from '@/components/ui/empty-state';
import { FileSearch } from 'lucide-react';

export default function AuditLogsPage() {
  return (
    <PageContainer>
      <ContentContainer>
        <PageHeader
          title="Audit Logs"
          description="Track changes and access across your organization."
        />
        <Section>
          <SectionHeader
            title="Activity Log"
            description="Chronological record of organizational changes"
          />
          <EmptyState
            icon={FileSearch}
            title="No audit entries yet"
            description="Audit logs will populate as changes are made to your organization."
          />
        </Section>
      </ContentContainer>
    </PageContainer>
  );
}
