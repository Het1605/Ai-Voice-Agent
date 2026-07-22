'use client';

import { Section, SectionHeader } from '@/components/layout';
import { EmptyState } from '@/components/ui/empty-state';
import { GitBranch } from 'lucide-react';

export default function AgentVersionsPage() {
  return (
    <Section>
      <SectionHeader title="Version History" description="Track changes and roll back agent configurations" />
      <EmptyState icon={GitBranch} title="No versions" description="Version history will be tracked as you make changes to this agent." />
    </Section>
  );
}
