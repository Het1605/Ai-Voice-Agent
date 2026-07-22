'use client';

import { PageContainer, ContentContainer, PageHeader, Section, SectionHeader } from '@/components/layout';
import { Grid } from '@/components/layout';
import { Panel } from '@/components/ui/panel';
import { EmptyState } from '@/components/ui/empty-state';
import { BarChart3, TrendingUp, Activity, PieChart } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <PageContainer>
      <ContentContainer>
        <PageHeader
          title="Analytics"
          description="Monitor business and technical performance metrics."
        />

        <div className="mt-8">
          <Grid cols={1} sm={2} gap={4}>
            <Panel title="Call Volume" description="Calls over time">
              <div className="flex h-48 items-center justify-center text-muted-foreground text-sm">
                Chart placeholder
              </div>
            </Panel>
            <Panel title="Agent Performance" description="Per-agent breakdown">
              <div className="flex h-48 items-center justify-center text-muted-foreground text-sm">
                Chart placeholder
              </div>
            </Panel>
          </Grid>
        </div>

        <div className="mt-8">
          <Section>
            <SectionHeader
              title="Detailed Reports"
              description="Exportable analytics and reports"
            />
            <EmptyState
              icon={BarChart3}
              title="No data available"
              description="Analytics will populate once your agents begin handling calls."
            />
          </Section>
        </div>
      </ContentContainer>
    </PageContainer>
  );
}
