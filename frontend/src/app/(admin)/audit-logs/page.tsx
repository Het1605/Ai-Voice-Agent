import { PageHeader } from '@/components/layout';
import { Section, SectionHeader } from '@/components/layout';
import { EmptyState } from '@/components/ui/empty-state';
import { FileSearch } from 'lucide-react';

export default function AdminAuditLogsPage() {
  return (
    <>
      <PageHeader title="Audit Logs" description="System-wide audit trail of all platform activity." />
      <Section>
        <SectionHeader title="Activity Log" description="Complete audit trail" />
        <EmptyState icon={FileSearch} title="No audit entries" description="Audit logs will populate as platform activity occurs." />
      </Section>
    </>
  );
}
