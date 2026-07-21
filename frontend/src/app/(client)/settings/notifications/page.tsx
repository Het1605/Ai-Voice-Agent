import { PageContainer, ContentContainer, PageHeader } from '@/components/layout';
import { Section, SectionHeader } from '@/components/layout';
import { Form, FormField, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ActionGroup } from '@/components/ui/action-group';
import { Separator } from '@/components/ui/separator';
import { Link } from '@/components/ui/link';

export default function NotificationSettingsPage() {
  return (
    <PageContainer>
      <ContentContainer maxWidth="max-w-2xl">
        <PageHeader
          title="Notifications"
          description="Control how and when you receive notifications."
        />

        <div className="mt-8 space-y-10">
          <Section>
            <SectionHeader
              title="Email Notifications"
              description="Choose which updates you receive via email"
            />
            <Form>
              <FormField name="email-calls">
                <FormLabel>Call summaries</FormLabel>
                <Switch />
              </FormField>
              <FormField name="email-agents">
                <FormLabel>Agent status changes</FormLabel>
                <Switch defaultChecked />
              </FormField>
              <FormField name="email-billing">
                <FormLabel>Billing and invoices</FormLabel>
                <Switch defaultChecked />
              </FormField>
              <FormField name="email-team">
                <FormLabel>Team activity</FormLabel>
                <Switch />
              </FormField>
              <Separator />
              <ActionGroup>
                <Button variant="outline">Cancel</Button>
                <Button>Save Preferences</Button>
              </ActionGroup>
            </Form>
          </Section>

          <Link href="/settings" variant="muted" size="sm">← Back to Settings</Link>
        </div>
      </ContentContainer>
    </PageContainer>
  );
}
