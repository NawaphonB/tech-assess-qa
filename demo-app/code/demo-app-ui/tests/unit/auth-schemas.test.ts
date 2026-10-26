import { describe, expect, it } from 'vitest';
import { signupSchema } from '@/src/features/auth/schemas/auth-schemas';

const signup = (password: string) =>
  signupSchema.safeParse({ name: 'Jane Doe', email: 'jane@demo.com', password });

const firstError = (password: string) => {
  const result = signup(password);
  return result.success ? undefined : result.error.issues[0].message;
};

describe('UT-SIGN-04 signup password rules', () => {
  it('rejects fewer than 8 characters', () => {
    expect(firstError('Abc1234')).toBe('Password must be at least 8 characters');
  });

  it('requires an uppercase letter', () => {
    expect(firstError('abcd1234')).toBe('Password must contain an uppercase letter');
  });

  it('requires a number', () => {
    expect(firstError('Abcdefgh')).toBe('Password must contain a number');
  });

  it('accepts a password that meets every rule', () => {
    expect(signup('Smoke1234').success).toBe(true);
  });
});
