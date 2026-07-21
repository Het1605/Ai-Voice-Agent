'use client';

import { AuthLayout } from '@/components/layout';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Form, FormField, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ActionGroup } from '@/components/ui/action-group';
import { Link } from '@/components/ui/link';

export default function LoginPage() {
  return (
    <AuthLayout maxWidth="max-w-sm">
      <Heading level={2} className="text-center">Sign In</Heading>
      <Text size="sm" color="muted" align="center" className="mb-8">
        Welcome back to VoiceGateway
      </Text>

      <Form>
        <FormField name="email">
          <FormLabel>Email</FormLabel>
          <Input type="email" placeholder="you@example.com" />
          <FormMessage />
        </FormField>

        <FormField name="password">
          <FormLabel>Password</FormLabel>
          <Input type="password" placeholder="Enter your password" />
          <FormMessage />
        </FormField>

        <ActionGroup stretch>
          <Button className="w-full">Sign In</Button>
        </ActionGroup>
      </Form>

      <div className="mt-6 flex flex-col items-center gap-3 text-center">
        <Link href="/forgot-password" variant="muted" size="sm">
          Forgot your password?
        </Link>
        <Text size="sm" color="muted">
          Don&apos;t have an account?{' '}
          <Link href="/register" variant="default" size="sm">Create one</Link>
        </Text>
      </div>
    </AuthLayout>
  );
}
