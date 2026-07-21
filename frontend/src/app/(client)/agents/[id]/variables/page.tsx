import { Section, SectionHeader } from '@/components/layout';
import { EmptyState } from '@/components/ui/empty-state';
import { Variable } from 'lucide-react';

export default function AgentVariablesPage() {
  return (
    <Section>
      <SectionHeader title="Variables" description="Custom variables and parameters for this agent" />
      <EmptyState icon={Variable} title="No variables" description="Define variables to customize agent behavior based on call context." />
    </Section>
  );
}
