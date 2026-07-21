import { PageContainer, ContentContainer, PageHeader } from '@/components/layout';
import { Section, SectionHeader } from '@/components/layout';
import { Grid } from '@/components/layout';
import { Panel } from '@/components/ui/panel';
import { EmptyState } from '@/components/ui/empty-state';
import { Phone as PhoneIcon } from 'lucide-react';

export default function CallDetailPage() {
  return (
    <PageContainer>
      <ContentContainer>
        <PageHeader title="Call Details" description="Conversation transcript and metadata." />
        <div className="mt-8 space-y-6">
          <Grid cols={1} sm={2} lg={4} gap={4}>
            <Panel title="Duration"><div className="flex h-10 items-center text-sm text-muted-foreground">—</div></Panel>
            <Panel title="Status"><div className="flex h-10 items-center text-sm text-muted-foreground">—</div></Panel>
            <Panel title="Agent"><div className="flex h-10 items-center text-sm text-muted-foreground">—</div></Panel>
            <Panel title="Direction"><div className="flex h-10 items-center text-sm text-muted-foreground">—</div></Panel>
          </Grid>
          <Section>
            <SectionHeader title="Transcript" description="Full conversation log" />
            <EmptyState icon={PhoneIcon} title="No transcript" description="Transcript will appear once the call is processed." />
          </Section>
        </div>
      </ContentContainer>
    </PageContainer>
  );
}
