import { PageContainer, ContentContainer, PageHeader, Section, SectionHeader } from '@/components/layout';
import { Grid } from '@/components/layout';
import { Panel } from '@/components/ui/panel';
import { EmptyState } from '@/components/ui/empty-state';
import { Puzzle, Plug, Webhook, Phone } from 'lucide-react';

export default function IntegrationsPage() {
  return (
    <PageContainer>
      <ContentContainer>
        <PageHeader
          title="Integrations"
          description="Connect third-party tools and services."
        />

        <div className="mt-8">
          <Grid cols={1} sm={2} lg={3} gap={4}>
            <Panel title="Twilio" description="Telephony provider" variant="bordered">
              <div className="flex h-16 items-center justify-center text-muted-foreground text-sm">
                Not connected
              </div>
            </Panel>
            <Panel title="Webhooks" description="Event notifications" variant="bordered">
              <div className="flex h-16 items-center justify-center text-muted-foreground text-sm">
                Not configured
              </div>
            </Panel>
            <Panel title="Custom API" description="REST API access" variant="bordered">
              <div className="flex h-16 items-center justify-center text-muted-foreground text-sm">
                API key required
              </div>
            </Panel>
          </Grid>
        </div>

        <div className="mt-8">
          <Section>
            <SectionHeader
              title="Available Integrations"
              description="Expand your agent capabilities"
            />
            <EmptyState
              icon={Puzzle}
              title="More integrations coming soon"
              description="CRM, CRM, and analytics integrations are on the roadmap."
            />
          </Section>
        </div>
      </ContentContainer>
    </PageContainer>
  );
}
