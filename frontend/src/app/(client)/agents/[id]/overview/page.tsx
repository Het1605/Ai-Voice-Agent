import { Section, SectionHeader } from '@/components/layout';
import { Grid } from '@/components/layout';
import { Panel } from '@/components/ui/panel';
import { EmptyState } from '@/components/ui/empty-state';
import { Activity, Bot, Phone, CheckCircle2 } from 'lucide-react';

export default function AgentOverviewPage() {
  return (
    <div className="space-y-6">
      <Grid cols={1} sm={2} lg={4} gap={4}>
        <Panel title="Status" description="Current agent state">
          <div className="flex h-16 items-center text-sm text-muted-foreground">Not deployed</div>
        </Panel>
        <Panel title="Calls Today" description="Last 24 hours">
          <div className="flex h-16 items-center text-sm text-muted-foreground">0 calls</div>
        </Panel>
        <Panel title="Avg. Duration" description="Per call">
          <div className="flex h-16 items-center text-sm text-muted-foreground">—</div>
        </Panel>
        <Panel title="Success Rate" description="Completion rate">
          <div className="flex h-16 items-center text-sm text-muted-foreground">—</div>
        </Panel>
      </Grid>

      <Section>
        <SectionHeader title="Recent Activity" description="Latest agent interactions" />
        <EmptyState icon={Activity} title="No activity yet" description="Agent activity will appear here once calls start flowing." />
      </Section>
    </div>
  );
}
