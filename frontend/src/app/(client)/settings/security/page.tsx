import { PageContainer, ContentContainer, PageHeader } from '@/components/layout';
import { Section, SectionHeader } from '@/components/layout';
import { Form, FormField, FormLabel, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ActionGroup } from '@/components/ui/action-group';
import { Separator } from '@/components/ui/separator';
import { Link } from '@/components/ui/link';

export default function SecuritySettingsPage() {
  return (
    <PageContainer>
      <ContentContainer maxWidth="max-w-2xl">
        <PageHeader
          title="Security"
          description="Manage password and authentication settings."
        />

        <div className="mt-8 space-y-10">
          <Section>
            <SectionHeader
              title="Change Password"
              description="Update your account password"
            />
            <Form>
              <FormField name="current-password">
                <FormLabel>Current Password</FormLabel>
                <Input type="password" />
              </FormField>
              <FormField name="new-password">
                <FormLabel>New Password</FormLabel>
                <Input type="password" />
              </FormField>
              <FormField name="confirm-password">
                <FormLabel>Confirm New Password</FormLabel>
                <Input type="password" />
              </FormField>
              <Separator />
              <ActionGroup>
                <Button variant="outline">Cancel</Button>
                <Button>Update Password</Button>
              </ActionGroup>
            </Form>
          </Section>

          <Section>
            <SectionHeader
              title="Two-Factor Authentication"
              description="Add an extra layer of security"
            />
            <Form>
              <FormField name="2fa">
                <FormDescription>
                  Two-factor authentication adds an additional layer of
                  protection to your account. This feature will be available
                  in a future update.
                </FormDescription>
              </FormField>
            </Form>
          </Section>

          <Link href="/settings" variant="muted" size="sm">← Back to Settings</Link>
        </div>
      </ContentContainer>
    </PageContainer>
  );
}
