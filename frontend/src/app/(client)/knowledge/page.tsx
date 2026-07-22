'use client';

import { PageContainer, ContentContainer, PageHeader, Section, SectionHeader } from '@/components/layout';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { PageActions } from '@/components/layout';
import { BookOpen, Plus } from 'lucide-react';

export default function KnowledgePage() {
  return (
    <PageContainer>
      <ContentContainer>
        <PageHeader
          title="Knowledge"
          description="Manage knowledge sources, collections, and documents."
          actions={
            <PageActions>
              <Button>
                <Plus className="h-4 w-4" />
                Add Source
              </Button>
            </PageActions>
          }
        />

        <Section>
          <SectionHeader
            title="Knowledge Bases"
            description="Documents and data your agents can reference"
          />
          <EmptyState
            icon={BookOpen}
            title="No knowledge sources"
            description="Add documents, websites, or data sources to power your agents."
            action={<Button variant="outline">Add Source</Button>}
          />
        </Section>
      </ContentContainer>
    </PageContainer>
  );
}
