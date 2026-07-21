import { PageContainer, ContentContainer, PageHeader } from '@/components/layout';
import { Section, SectionHeader } from '@/components/layout';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { PageActions } from '@/components/layout';
import { KeyRound, Plus } from 'lucide-react';

export default function ApiKeysPage() {
  return (
    <PageContainer>
      <ContentContainer>
        <PageHeader
          title="API Keys"
          description="Manage API keys for programmatic access."
          actions={
            <PageActions>
              <Button>
                <Plus className="h-4 w-4" />
                Create API Key
              </Button>
            </PageActions>
          }
        />

        <Section>
          <SectionHeader
            title="Active Keys"
            description="Keys that can be used to authenticate API requests"
          />
          <EmptyState
            icon={KeyRound}
            title="No API keys"
            description="Create an API key to integrate VoiceGateway with your applications."
            action={<Button variant="outline">Create API Key</Button>}
          />
        </Section>
      </ContentContainer>
    </PageContainer>
  );
}
