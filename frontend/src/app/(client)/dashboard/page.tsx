'use client';

import { PageContainer, ContentContainer } from '@/components/layout';
import { PageHeader } from '@/components/layout';
import { Section, SectionHeader } from '@/components/layout';
import { Grid } from '@/components/layout';
import { EmptyState } from '@/components/ui/empty-state';
import { Panel } from '@/components/ui/panel';
import { BarChart3, Activity, TrendingUp, Users } from 'lucide-react';

export default function DashboardPage() {
  return (
    <PageContainer>
      <ContentContainer>
        <PageHeader
          title="Dashboard"
          description="Welcome back. Here&apos;s an overview of your platform."
        />

        {/* Metrics grid */}
        <div className="mt-8">
          <Grid cols={1} sm={2} lg={4} gap={4}>
            <Panel title="Total Calls" description="All time call volume">
              <div className="flex h-20 items-center justify-center text-muted-foreground text-sm">
                No data yet
              </div>
            </Panel>
            <Panel title="Active Agents" description="Currently deployed">
              <div className="flex h-20 items-center justify-center text-muted-foreground text-sm">
                No data yet
              </div>
            </Panel>
            <Panel title="Avg. Duration" description="Per call">
              <div className="flex h-20 items-center justify-center text-muted-foreground text-sm">
                No data yet
              </div>
            </Panel>
            <Panel title="Success Rate" description="Last 30 days">
              <div className="flex h-20 items-center justify-center text-muted-foreground text-sm">
                No data yet
              </div>
            </Panel>
          </Grid>
        </div>

        {/* Recent activity section */}
        <div className="mt-8">
          <Section>
            <SectionHeader
              title="Recent Activity"
              description="Your latest platform activity will appear here"
            />
            <EmptyState
              icon={Activity}
              title="No recent activity"
              description="Activity from calls, agent changes, and team updates will show here."
            />
          </Section>
        </div>
      </ContentContainer>
    </PageContainer>
  );
}
