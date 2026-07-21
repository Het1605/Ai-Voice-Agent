import { PageHeader } from '@/components/layout';
import { Section, SectionHeader } from '@/components/layout';
import { Grid } from '@/components/layout';
import { Panel } from '@/components/ui/panel';
import { EmptyState } from '@/components/ui/empty-state';
import { Shield } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <>
      <PageHeader title="Admin Dashboard" description="System-wide overview and management." />
      <div className="mt-8 space-y-6">
        <Grid cols={1} sm={3} gap={4}>
          <Panel title="Organizations"><div className="flex h-12 items-center text-sm text-muted-foreground">—</div></Panel>
          <Panel title="Users"><div className="flex h-12 items-center text-sm text-muted-foreground">—</div></Panel>
          <Panel title="Active Sessions"><div className="flex h-12 items-center text-sm text-muted-foreground">—</div></Panel>
        </Grid>
        <Section>
          <SectionHeader title="System Health" description="Platform status and metrics" />
          <EmptyState icon={Shield} title="System monitoring coming soon" description="Real-time platform health metrics will be displayed here." />
        </Section>
      </div>
    </>
  );
}
