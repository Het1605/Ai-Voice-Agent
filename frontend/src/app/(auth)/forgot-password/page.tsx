'use client';

import { useState, type FormEvent } from 'react';
import { AuthCard } from '@/components/auth';
import { Form, FormField, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from '@/components/ui/link';
import { Alert } from '@/components/ui/alert';
import { forgotPasswordSchema } from '@/lib/validation/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const clearError = () => {
    if (error) setError(undefined);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = forgotPasswordSchema.safeParse({ email: email.trim() });
    if (!result.success) {
      const issue = result.error.issues[0];
      setError(issue.message);
      return;
    }

    setIsSubmitting(true);
    try {
      // Backend endpoint not yet implemented — show success regardless
      // Future: POST /auth/forgot-password
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSuccess(true);
    } catch {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthCard
        title="Check your email"
        subtitle="If an account exists, we&apos;ve sent a reset link"
      >
        <Alert variant="success" className="mt-6">
          If an account exists with that email, we&apos;ve sent a password reset link.
        </Alert>
        <div className="mt-6 flex justify-center">
          <Link href="/login" variant="default" size="sm">
            Back to sign in
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email and we&apos;ll send you a reset link"
      footer={
        <Link href="/login" variant="muted" size="sm">
          Back to sign in
        </Link>
      }
    >
      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit} noValidate>
        <FormField name="email">
          <FormLabel required>Email</FormLabel>
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearError(); }}
            aria-invalid={!!error}
            autoComplete="email"
            required
          />
          {error && <FormMessage>{error}</FormMessage>}
        </FormField>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </Form>
    </AuthCard>
  );
}