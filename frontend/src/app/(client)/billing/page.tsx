import { PageContainer, ContentContainer, PageHeader, Section, SectionHeader } from '@/components/layout';
import { Grid } from '@/components/layout';
import { Panel } from '@/components/ui/panel';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { PageActions, PageActions as _PA } from '@/components/layout';
import { CreditCard, Receipt, Settings } from 'lucide-react';

export default function BillingPage() {
  return (
    <PageContainer>
      <ContentContainer>
        <PageHeader
          title="Billing"
          description="Manage your plan, subscriptions, and invoices."
        />

        <div className="mt-8">
          <Grid cols={1} sm={2} gap={4}>
            <Panel title="Current Plan" description="Your active subscription">
              <div className="flex h-24 items-center justify-center text-muted-foreground text-sm">
                No active plan
              </div>
            </Panel>
            <Panel title="Usage" description="Current billing period">
              <div className="flex h-24 items-center justify-center text-muted-foreground text-sm">
                No usage data
              </div>
            </Panel>
          </Grid>
        </div>

        <div className="mt-8">
          <Section>
            <SectionHeader
              title="Invoices"
              description="Past billing statements and receipts"
            />
            <EmptyState
              icon={Receipt}
              title="No invoices"
              description="Invoices will appear once you have a paid subscription."
            />
          </Section>
        </div>
      </ContentContainer>
    </PageContainer>
  );
}
