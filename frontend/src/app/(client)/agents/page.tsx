'use client';

import { PageContainer, ContentContainer, PageHeader, Section, SectionHeader } from '@/components/layout';
import { Grid } from '@/components/layout';
import { Panel } from '@/components/ui/panel';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { PageActions } from '@/components/layout';
import { Bot, Plus } from 'lucide-react';

export default function AgentsPage() {
  return (
    <PageContainer>
      <ContentContainer>
        <PageHeader
          title="Agents"
          description="Manage and configure your AI voice agents."
          actions={
            <PageActions>
              <Button>
                <Plus className="h-4 w-4" />
                Create Agent
              </Button>
            </PageActions>
          }
        />

        <Section>
          <SectionHeader
            title="All Agents"
            description="View, create, and manage your voice agents"
          />
          <EmptyState
            icon={Bot}
            title="No agents yet"
            description="Create your first AI voice agent to get started."
            action={<Button>Create Agent</Button>}
          />
        </Section>
      </ContentContainer>
    </PageContainer>
  );
}
