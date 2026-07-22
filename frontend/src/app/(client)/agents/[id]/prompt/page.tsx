'use client';

import { Section, SectionHeader } from '@/components/layout';
import { EmptyState } from '@/components/ui/empty-state';
import { MessageSquare } from 'lucide-react';

export default function AgentPromptPage() {
  return (
    <Section>
      <SectionHeader title="System Prompt" description="Define the agent's personality and behavior" />
      <EmptyState icon={MessageSquare} title="No prompt configured" description="Write a system prompt to define how your agent behaves during calls." />
    </Section>
  );
}
