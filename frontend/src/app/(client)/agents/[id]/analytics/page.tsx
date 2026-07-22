'use client';

import { Section, SectionHeader } from '@/components/layout';
import { Grid } from '@/components/layout';
import { Panel } from '@/components/ui/panel';
import { EmptyState } from '@/components/ui/empty-state';
import { BarChart3 } from 'lucide-react';

export default function AgentAnalyticsPage() {
  return (
    <div className="space-y-6">
      <Grid cols={1} sm={3} gap={4}>
        <Panel title="Total Calls" description="All time"><div className="flex h-12 items-center text-sm text-muted-foreground">—</div></Panel>
        <Panel title="Avg. Duration" description="Per call"><div className="flex h-12 items-center text-sm text-muted-foreground">—</div></Panel>
        <Panel title="Completion" description="Rate"><div className="flex h-12 items-center text-sm text-muted-foreground">—</div></Panel>
      </Grid>
      <Section>
        <SectionHeader title="Detailed Analytics" description="Per-agent performance metrics" />
        <EmptyState icon={BarChart3} title="No analytics available" description="Analytics will populate once the agent has handled calls." />
      </Section>
    </div>
  );
}
