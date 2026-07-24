'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AuthCard } from '@/components/auth';
import { Form, FormField, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from '@/components/ui/link';
import { useRegister } from '@/hooks';
import { Alert } from '@/components/ui/alert';
import { CheckCircle2, XCircle } from 'lucide-react';
import { registerSchema, passwordRequirements } from '@/lib/validation/auth';

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegister();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => router.push('/login?registered=true'), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, router]);

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateAll = (): boolean => {
    const result = registerSchema.safeParse({
      firstName: firstName.trim(),
      lastName: lastName || undefined,
      email: email.trim(),
      password,
      confirmPassword,
    });
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
      await registerMutation.mutateAsync({
        email: email.trim(),
        password,
        first_name: firstName.trim() || undefined,
        last_name: lastName.trim() || undefined,
      });
      setIsSuccess(true);
    } catch {
      // Error displayed via registerMutation.error
    }
  };

  const apiError = registerMutation.error
    ? (registerMutation.error as { detail?: string; message?: string }).detail
      || (registerMutation.error as { message?: string }).message
      || 'Registration failed. Please try again.'
    : null;

  if (isSuccess) {
    return (
      <AuthCard
        title="Account Created"
        subtitle="Redirecting you to sign in..."
      >
        <Alert variant="success" className="mt-6">
          Your account has been created successfully!
        </Alert>
        <div className="mt-6 flex justify-center">
          <Link href="/login" variant="default" size="sm">
            Sign in now
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Get started with VoiceGateway"
      footer={
        <p className="text-body-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" variant="default" size="sm">
            Sign in
          </Link>
        </p>
      }
    >
      {apiError && (
        <Alert variant="error" className="mb-6">
          {apiError}
        </Alert>
      )}

      <Form onSubmit={handleSubmit} noValidate>
        {/* Name row — side by side on desktop */}
        <div className="grid grid-cols-2 gap-4">
          <FormField name="firstName">
            <FormLabel required>First Name</FormLabel>
            <Input
              placeholder="Jane"
              value={firstName}
              onChange={(e) => { setFirstName(e.target.value); clearError('firstName'); }}
              aria-invalid={!!errors.firstName}
              required
            />
            {errors.firstName && <FormMessage>{errors.firstName}</FormMessage>}
          </FormField>

          <FormField name="lastName">
            <FormLabel>Last Name</FormLabel>
            <Input
              placeholder="Smith"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </FormField>
        </div>

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
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
            aria-invalid={!!errors.password}
            autoComplete="new-password"
            required
          />
          {errors.password && <FormMessage>{errors.password}</FormMessage>}

          {/* Password requirements checklist */}
          {password.length > 0 && (
            <div className="mt-2 space-y-1">
              {passwordRequirements.map((req) => {
                const met = req.test(password);
                return (
                  <div key={req.label} className="flex items-center gap-1.5">
                    {met ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-muted-foreground/50" />
                    )}
                    <span
                      className={`text-small ${
                        met ? 'text-success' : 'text-muted-foreground/60'
                      }`}
                    >
                      {req.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </FormField>

        <FormField name="confirmPassword">
          <FormLabel required>Confirm Password</FormLabel>
          <Input
            type="password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); clearError('confirmPassword'); }}
            aria-invalid={!!errors.confirmPassword}
            autoComplete="new-password"
            required
          />
          {errors.confirmPassword && <FormMessage>{errors.confirmPassword}</FormMessage>}
        </FormField>

        <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
          {registerMutation.isPending ? 'Creating account...' : 'Create Account'}
        </Button>
      </Form>
    </AuthCard>
  );
}