import { PageHeader } from '@/components/layout';
import { Section, SectionHeader } from '@/components/layout';
import { EmptyState } from '@/components/ui/empty-state';
import { UserCog } from 'lucide-react';

export default function AdminUsersPage() {
  return (
    <>
      <PageHeader title="Users" description="Manage platform users and their access." />
      <Section>
        <SectionHeader title="All Users" description="Complete list of registered users" />
        <EmptyState icon={UserCog} title="No users" description="User accounts will appear once registration is enabled." />
      </Section>
    </>
  );
}
