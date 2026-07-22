'use client';

import { Section, SectionHeader } from '@/components/layout';
import { EmptyState } from '@/components/ui/empty-state';
import { BookOpen } from 'lucide-react';

export default function AgentKnowledgePage() {
  return (
    <Section>
      <SectionHeader title="Knowledge Sources" description="Documents and data linked to this agent" />
      <EmptyState icon={BookOpen} title="No knowledge sources" description="Attach knowledge bases to give your agent domain-specific information." />
    </Section>
  );
}
