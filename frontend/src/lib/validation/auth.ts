/**
 * Auth Validation Schemas
 *
 * Single source of truth for all auth form validation rules.
 * Consumed by login, register, and forgot-password pages.
 *
 * Rules:
 *   Email: non-empty, standard email format
 *   Password: min 8 chars, at least 1 uppercase, 1 lowercase, 1 number
 *   Name: non-empty (first), optional (last)
 */

import { z } from 'zod';

// ─── Helpers ─────────────────────────────────────────────────────────

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const hasUppercase = /[A-Z]/;
const hasLowercase = /[a-z]/;
const hasNumber = /[0-9]/;

// ─── Schemas ──────────────────────────────────────────────────────────

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .regex(emailPattern, 'Please enter a valid email address');

export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters')
  .regex(hasUppercase, 'Password must contain at least one uppercase letter')
  .regex(hasLowercase, 'Password must contain at least one lowercase letter')
  .regex(hasNumber, 'Password must contain at least one number');

export const firstNameSchema = z
  .string()
  .min(1, 'First name is required');

export const lastNameSchema = z
  .string()
  .optional();

// ─── Form Schemas ─────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// ─── Validation Helpers ───────────────────────────────────────────────

export interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

export const passwordRequirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { label: 'One uppercase letter', test: (pw) => hasUppercase.test(pw) },
  { label: 'One lowercase letter', test: (pw) => hasLowercase.test(pw) },
  { label: 'One number', test: (pw) => hasNumber.test(pw) },
];

/**
 * Safely parse form data against a schema and return typed errors.
 * Returns `{ success: true, data: T }` or `{ success: false, errors: Record<string, string> }`.
 */
export function validateForm<T extends z.ZodType>(
  schema: T,
  data: unknown,
): { success: true; data: z.infer<T> } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }
  return { success: false, errors };
}