'use client';

import { Section, SectionHeader } from '@/components/layout';
import { EmptyState } from '@/components/ui/empty-state';
import { FlaskConical } from 'lucide-react';

export default function AgentTestingPage() {
  return (
    <Section>
      <SectionHeader title="Testing" description="Preview and test your agent's behavior" />
      <EmptyState icon={FlaskConical} title="No tests run" description="Test your agent with sample conversations before deploying." />
    </Section>
  );
}
