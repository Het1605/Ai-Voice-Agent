import { PageContainer, ContentContainer, PageHeader } from '@/components/layout';
import { Section, SectionHeader } from '@/components/layout';
import { SplitLayout } from '@/components/layout';
import { Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import { ActionGroup } from '@/components/ui/action-group';
import { Form, FormField, FormLabel, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Link } from '@/components/ui/link';

export default function SettingsPage() {
  return (
    <PageContainer>
      <ContentContainer maxWidth="max-w-4xl">
        <PageHeader
          title="Settings"
          description="Manage your account and organization preferences."
        />

        <div className="mt-8 space-y-10">
          {/* General Settings */}
          <Section>
            <SectionHeader
              title="General"
              description="Basic organization information"
            />
            <Form>
              <FormField name="organization-name">
                <FormLabel>Organization Name</FormLabel>
                <Input placeholder="Acme Corp" />
                <FormDescription>This appears on invoices and team notifications.</FormDescription>
              </FormField>
              <FormField name="organization-slug">
                <FormLabel>Organization Slug</FormLabel>
                <Input placeholder="acme-corp" />
                <FormDescription>Used in URLs and API references.</FormDescription>
              </FormField>
              <Separator />
              <ActionGroup>
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </ActionGroup>
            </Form>
          </Section>

          {/* Sub-page links */}
          <Section>
            <SectionHeader
              title="Advanced Settings"
              description="Security, notifications, and API key management"
            />
            <div className="space-y-2">
              <Link href="/settings/security" variant="muted" size="md">
                Security Settings
              </Link>
              <br />
              <Link href="/settings/notifications" variant="muted" size="md">
                Notification Preferences
              </Link>
              <br />
              <Link href="/settings/api-keys" variant="muted" size="md">
                API Keys
              </Link>
            </div>
          </Section>
        </div>
      </ContentContainer>
    </PageContainer>
  );
}
