import { z } from 'zod';
import { VALIDATION_REGEX } from '../../constants/validation';

export const loginSchema = z.object({
  emailOrPhone: z.string().trim().min(1, 'Email or Phone is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
    email: z.string().trim().toLowerCase().email('Invalid email address'),
    phone: z.string().regex(VALIDATION_REGEX.PHONE, 'Invalid phone number (10-digit number starting with 6-9)'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    customerType: z.enum(['individual', 'business']).default('individual'),
    businessName: z.string().trim().optional(),
    gstNumber: z.string().trim().toUpperCase().optional(),
    address: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      if (data.customerType === 'business') {
        return !!data.businessName && data.businessName.length >= 2;
      }
      return true;
    },
    {
      message: 'Shop name must be at least 2 characters',
      path: ['businessName'],
    }
  )
  .refine(
    (data) => {
      if (data.customerType === 'business') {
        return !!data.gstNumber && data.gstNumber.length >= 15;
      }
      return true;
    },
    {
      message: 'GST number must be at least 15 characters',
      path: ['gstNumber'],
    }
  )
  .refine(
    (data) => {
      if (data.customerType === 'business') {
        return !!data.address && data.address.length >= 5;
      }
      return true;
    },
    {
      message: 'Address must be at least 5 characters',
      path: ['address'],
    }
  );

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, 'Reset token is required'),
  password: z.string().min(6, 'New password must be at least 6 characters'),
});
