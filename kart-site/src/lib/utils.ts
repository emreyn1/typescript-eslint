import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string, currency = 'USD'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(num);
}

export function formatCardNumber(cardNumber: string): string {
  return cardNumber.replace(/(\d{4})/g, '$1 ').trim();
}

export function maskCardNumber(cardNumber: string): string {
  const last4 = cardNumber.slice(-4);
  return `•••• •••• •••• ${last4}`;
}

export function generateCardNumber(): string {
  const prefix = '4532';
  let number = prefix;
  for (let i = 0; i < 12; i++) {
    number += Math.floor(Math.random() * 10);
  }
  return number;
}

export function generateCVV(): string {
  return Math.floor(100 + Math.random() * 900).toString();
}

export function generateExpiryDate(): { month: string; year: string } {
  const now = new Date();
  const futureDate = new Date(now.setFullYear(now.getFullYear() + 3));
  return {
    month: String(futureDate.getMonth() + 1).padStart(2, '0'),
    year: String(futureDate.getFullYear()).slice(-2),
  };
}

export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
