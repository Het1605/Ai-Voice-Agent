import { Section, SectionHeader } from '@/components/layout';
import { EmptyState } from '@/components/ui/empty-state';
import { Rocket } from 'lucide-react';

export default function AgentDeployPage() {
  return (
    <Section>
      <SectionHeader title="Deployment" description="Deploy and manage agent releases" />
      <EmptyState icon={Rocket} title="Not deployed" description="Configure your agent and deploy it to production or staging environments." />
    </Section>
  );
}
