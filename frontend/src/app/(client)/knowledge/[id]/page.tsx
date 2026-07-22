'use client';

import { PageContainer, ContentContainer, PageHeader } from '@/components/layout';
import { Section, SectionHeader } from '@/components/layout';
import { EmptyState } from '@/components/ui/empty-state';
import { BookOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageActions } from '@/components/layout';

export default function KnowledgeDetailPage() {
  return (
    <PageContainer>
      <ContentContainer>
        <PageHeader
          title="Knowledge Base"
          description="Manage documents and sources for this knowledge base."
          actions={
            <PageActions>
              <Button>
                <Plus className="h-4 w-4" />
                Add Document
              </Button>
            </PageActions>
          }
        />
        <div className="mt-8">
          <Section>
            <SectionHeader title="Documents" description="All documents in this knowledge base" />
            <EmptyState icon={BookOpen} title="No documents" description="Add documents to populate this knowledge base." />
          </Section>
        </div>
      </ContentContainer>
    </PageContainer>
  );
}
