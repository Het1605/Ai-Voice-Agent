import { PageHeader } from '@/components/layout';
import { Section, SectionHeader } from '@/components/layout';
import { EmptyState } from '@/components/ui/empty-state';
import { Building2 } from 'lucide-react';

export default function AdminOrganizationsPage() {
  return (
    <>
      <PageHeader title="Organizations" description="Manage all organizations on the platform." />
      <Section>
        <SectionHeader title="All Organizations" description="Complete list of registered organizations" />
        <EmptyState icon={Building2} title="No organizations" description="Organizations will appear here once users register." />
      </Section>
    </>
  );
}
