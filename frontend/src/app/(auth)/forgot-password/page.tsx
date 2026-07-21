'use client';

import { AuthLayout } from '@/components/layout';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Form, FormField, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ActionGroup } from '@/components/ui/action-group';
import { Link } from '@/components/ui/link';

export default function ForgotPasswordPage() {
  return (
    <AuthLayout maxWidth="max-w-sm">
      <Heading level={2} className="text-center">Reset Password</Heading>
      <Text size="sm" color="muted" align="center" className="mb-8">
        Enter your email and we&apos;ll send you a reset link
      </Text>

      <Form>
        <FormField name="email">
          <FormLabel>Email</FormLabel>
          <Input type="email" placeholder="you@example.com" />
          <FormMessage />
        </FormField>

        <ActionGroup stretch>
          <Button className="w-full">Send Reset Link</Button>
        </ActionGroup>
      </Form>

      <div className="mt-6 text-center">
        <Link href="/login" variant="muted" size="sm">
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
