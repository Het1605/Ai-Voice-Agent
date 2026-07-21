'use client';

import { AuthLayout } from '@/components/layout';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Form, FormField, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ActionGroup } from '@/components/ui/action-group';
import { Link } from '@/components/ui/link';

export default function RegisterPage() {
  return (
    <AuthLayout maxWidth="max-w-sm">
      <Heading level={2} className="text-center">Create Account</Heading>
      <Text size="sm" color="muted" align="center" className="mb-8">
        Get started with VoiceGateway
      </Text>

      <Form>
        <FormField name="name">
          <FormLabel>Full Name</FormLabel>
          <Input placeholder="Jane Smith" />
          <FormMessage />
        </FormField>

        <FormField name="email">
          <FormLabel>Email</FormLabel>
          <Input type="email" placeholder="you@example.com" />
          <FormMessage />
        </FormField>

        <FormField name="password">
          <FormLabel>Password</FormLabel>
          <Input type="password" placeholder="Create a strong password" />
          <FormMessage />
        </FormField>

        <ActionGroup stretch>
          <Button className="w-full">Create Account</Button>
        </ActionGroup>
      </Form>

      <div className="mt-6 text-center">
        <Text size="sm" color="muted">
          Already have an account?{' '}
          <Link href="/login" variant="default" size="sm">Sign in</Link>
        </Text>
      </div>
    </AuthLayout>
  );
}
