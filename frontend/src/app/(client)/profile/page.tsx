import { PageContainer, ContentContainer, PageHeader } from '@/components/layout';
import { Section, SectionHeader } from '@/components/layout';
import { Form, FormField, FormLabel, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ActionGroup } from '@/components/ui/action-group';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function ProfilePage() {
  return (
    <PageContainer>
      <ContentContainer maxWidth="max-w-2xl">
        <PageHeader
          title="Profile"
          description="Manage your personal profile and preferences."
        />

        <div className="mt-8 space-y-10">
          {/* Avatar */}
          <Section>
            <SectionHeader
              title="Profile Photo"
              description="Your avatar appears in the header and team views"
            />
            <div className="flex items-center gap-4">
              <Avatar size="lg">
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">Change Photo</Button>
              <Button variant="ghost" size="sm">Remove</Button>
            </div>
          </Section>

          {/* Personal Info */}
          <Section>
            <SectionHeader
              title="Personal Information"
              description="Update your name and contact details"
            />
            <Form>
              <FormField name="name">
                <FormLabel>Full Name</FormLabel>
                <Input placeholder="Jane Doe" />
              </FormField>
              <FormField name="email">
                <FormLabel>Email</FormLabel>
                <Input type="email" placeholder="jane@example.com" />
                <FormDescription>Used for login and notifications.</FormDescription>
              </FormField>
              <Separator />
              <ActionGroup>
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </ActionGroup>
            </Form>
          </Section>
        </div>
      </ContentContainer>
    </PageContainer>
  );
}
