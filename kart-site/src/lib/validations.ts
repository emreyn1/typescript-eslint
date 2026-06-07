import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  twoFactorCode: z.string().length(6).optional(),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  referralCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const topupSchema = z.object({
  amount: z.number().min(10, 'Minimum deposit is $10').max(10000, 'Maximum deposit is $10,000'),
  currency: z.string().default('USD'),
  walletType: z.enum(['USD', 'EUR', 'USDT']).optional(),
  crypto: z.string().optional(),
});

export const withdrawSchema = z.object({
  walletType: z.enum(['USD', 'EUR', 'USDT']),
  amount: z.number().min(20, 'Minimum withdrawal is $20'),
  address: z.string().min(30, 'Invalid wallet address').max(50),
  twoFactorCode: z.string().length(6).optional(),
});

export const exchangeSchema = z.object({
  fromWallet: z.enum(['USD', 'EUR', 'USDT']),
  toWallet: z.enum(['USD', 'EUR', 'USDT']),
  amount: z.number().positive('Amount must be positive').min(1, 'Minimum exchange is $1'),
});

export const cardPurchaseSchema = z.object({
  variant: z.enum(['NEXUS_3D', 'OMNI_LITE', 'OMNI_PRO']),
  walletType: z.enum(['USD', 'EUR', 'USDT']),
  cardHolder: z.string().min(2, 'Cardholder name is required').max(50),
});

export const cardLoadSchema = z.object({
  walletType: z.enum(['USD', 'EUR', 'USDT']),
  amount: z.number().min(1, 'Minimum load is $1').max(5000, 'Maximum load is $5,000'),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export const twoFactorVerifySchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type TopupInput = z.infer<typeof topupSchema>;
export type WithdrawInput = z.infer<typeof withdrawSchema>;
export type ExchangeInput = z.infer<typeof exchangeSchema>;
export type CardPurchaseInput = z.infer<typeof cardPurchaseSchema>;
export type CardLoadInput = z.infer<typeof cardLoadSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
export type TwoFactorVerifyInput = z.infer<typeof twoFactorVerifySchema>;
