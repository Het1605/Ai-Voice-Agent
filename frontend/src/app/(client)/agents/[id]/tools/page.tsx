import { Section, SectionHeader } from '@/components/layout';
import { EmptyState } from '@/components/ui/empty-state';
import { Wrench } from 'lucide-react';

export default function AgentToolsPage() {
  return (
    <Section>
      <SectionHeader title="Tools & Functions" description="APIs and functions your agent can call during conversations" />
      <EmptyState icon={Wrench} title="No tools configured" description="Add tools to give your agent the ability to perform actions and fetch data." />
    </Section>
  );
}
