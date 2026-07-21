import { PageContainer, ContentContainer, PageHeader, Section, SectionHeader } from '@/components/layout';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { PageActions } from '@/components/layout';
import { Users, UserPlus } from 'lucide-react';

export default function TeamPage() {
  return (
    <PageContainer>
      <ContentContainer>
        <PageHeader
          title="Team"
          description="Manage organization members and roles."
          actions={
            <PageActions>
              <Button>
                <UserPlus className="h-4 w-4" />
                Invite Member
              </Button>
            </PageActions>
          }
        />

        <Section>
          <SectionHeader
            title="Members"
            description="People with access to this organization"
          />
          <EmptyState
            icon={Users}
            title="No team members"
            description="Invite team members to collaborate on agents and calls."
            action={<Button variant="outline">Invite Member</Button>}
          />
        </Section>
      </ContentContainer>
    </PageContainer>
  );
}
