'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthCard } from '@/components/auth';
import { Form, FormField, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from '@/components/ui/link';
import { useLogin } from '@/hooks';
import { Alert } from '@/components/ui/alert';
import { loginSchema } from '@/lib/validation/auth';

interface FormErrors {
  email?: string;
  password?: string;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === 'true';
  const loginMutation = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateAll = (): boolean => {
    const result = loginSchema.safeParse({ email: email.trim(), password });
    if (result.success) {
      setErrors({});
      return true;
    }
    const fieldErrors: FormErrors = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join('.') as keyof FormErrors;
      if (!fieldErrors[path]) fieldErrors[path] = issue.message;
    }
    setErrors(fieldErrors);
    return false;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;

    try {
      await loginMutation.mutateAsync({ email: email.trim(), password });
      router.push('/dashboard');
    } catch {
      // Error displayed via loginMutation.error
    }
  };

  const apiError = loginMutation.error
    ? (loginMutation.error as { detail?: string; message?: string }).detail
      || (loginMutation.error as { message?: string }).message
      || 'An unexpected error occurred. Please try again.'
    : null;

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your VoiceGateway account"
      footer={
        <>
          <Link href="/forgot-password" variant="muted" size="sm">
            Forgot your password?
          </Link>
          <p className="text-body-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" variant="default" size="sm">
              Create one
            </Link>
          </p>
        </>
      }
    >
      {justRegistered && (
        <Alert variant="success" className="mb-6">
          Account created successfully! Sign in with your credentials.
        </Alert>
      )}

      {apiError && (
        <Alert variant="error" className="mb-6">
          {apiError}
        </Alert>
      )}

      <Form onSubmit={handleSubmit} noValidate>
        <FormField name="email">
          <FormLabel required>Email</FormLabel>
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
            aria-invalid={!!errors.email}
            autoComplete="email"
            required
          />
          {errors.email && <FormMessage>{errors.email}</FormMessage>}
        </FormField>

        <FormField name="password">
          <FormLabel required>Password</FormLabel>
          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
            aria-invalid={!!errors.password}
            autoComplete="current-password"
            required
          />
          {errors.password && <FormMessage>{errors.password}</FormMessage>}
        </FormField>

        <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
        </Button>
      </Form>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}