import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number): string {
  return `${amount.toFixed(2)} AED`
}

export const CURRENCY_CODE = "aed" as const
export const CURRENCY_SYMBOL = "AED"
