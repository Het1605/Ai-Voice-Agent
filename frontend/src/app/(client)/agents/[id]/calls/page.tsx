'use client';

import { Section, SectionHeader } from '@/components/layout';
import { EmptyState } from '@/components/ui/empty-state';
import { Phone } from 'lucide-react';

export default function AgentCallsPage() {
  return (
    <Section>
      <SectionHeader title="Call History" description="Calls handled by this agent" />
      <EmptyState icon={Phone} title="No calls yet" description="Call logs will appear here once the agent starts handling conversations." />
    </Section>
  );
}
