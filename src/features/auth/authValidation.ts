import { z } from 'zod';
import { VALIDATION_REGEX } from '../../constants/validation';

export const loginSchema = z.object({
  emailOrPhone: z.string().trim().min(1, 'Email or Phone is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  shopId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Shop ID format'),
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  phone: z.string().regex(VALIDATION_REGEX.PHONE, 'Invalid phone number (10-digit number starting with 6-9)'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const forgotPasswordSchema = z.object({
  shopId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Shop ID format'),
  email: z.string().trim().toLowerCase().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, 'Reset token is required'),
  password: z.string().min(6, 'New password must be at least 6 characters'),
});
