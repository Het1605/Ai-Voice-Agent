/**
 * Auth Validation Tests
 *
 * Tests the shared Zod validation schemas directly.
 * Pure logic — no React, no mocks needed.
 */

import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  emailSchema,
  passwordSchema,
  passwordRequirements,
} from '@/lib/validation/auth';

describe('loginSchema', () => {
  it('accepts valid login credentials', () => {
    const result = loginSchema.safeParse({
      email: 'jane@example.com',
      password: 'any_password',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty email', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: 'any_password',
    });
    expect(result.success).toBe(false);
  });

  it('rejects malformed email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'any_password',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({
      email: 'jane@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  const validData = {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    password: 'StrongPass1',
    confirmPassword: 'StrongPass1',
  };

  it('accepts valid registration data', () => {
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('accepts missing last name', () => {
    const result = registerSchema.safeParse({ ...validData, lastName: undefined });
    expect(result.success).toBe(true);
  });

  it('rejects short password', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'Short1A',
      confirmPassword: 'Short1A',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password without uppercase', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'lowercase1',
      confirmPassword: 'lowercase1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password without number', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'UPPERCASEa',
      confirmPassword: 'UPPERCASEa',
    });
    expect(result.success).toBe(false);
  });

  it('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({
      ...validData,
      confirmPassword: 'Different1a',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty first name', () => {
    const result = registerSchema.safeParse({
      ...validData,
      firstName: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('forgotPasswordSchema', () => {
  it('accepts a valid email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'jane@example.com' });
    expect(result.success).toBe(true);
  });

  it('rejects empty email', () => {
    const result = forgotPasswordSchema.safeParse({ email: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'bad' });
    expect(result.success).toBe(false);
  });
});

describe('passwordRequirements', () => {
  it('all checks pass for a strong password', () => {
    const results = passwordRequirements.map((r) => r.test('StrongPass1'));
    expect(results.every(Boolean)).toBe(true);
  });

  it('fails length check for short password', () => {
    const [lengthCheck] = passwordRequirements;
    expect(lengthCheck.test('Ab1')).toBe(false);
  });

  it('fails uppercase check', () => {
    const [, uppercaseCheck] = passwordRequirements;
    expect(uppercaseCheck.test('alllowercase1')).toBe(false);
  });

  it('fails number check', () => {
    const [, , , numberCheck] = passwordRequirements;
    expect(numberCheck.test('NoNumbersA')).toBe(false);
  });
});